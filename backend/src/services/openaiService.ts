async extractTextFromImage(imagePath, documentType) {
  const MAX_RETRIES = 3;
  let retryCount = 0;

  while (retryCount < MAX_RETRIES) {
    try {
      // Read the image file
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');

      // Get image metadata using sharp
      const metadata = await sharp(imagePath).metadata();
      const isRotated = metadata.orientation && metadata.orientation > 1;

      // Prepare the prompt with orientation context
      const orientationContext = isRotated ? 
        "Note: This image has been rotated. Please analyze the text in its current orientation." : "";

      const documentTypePrompt = `This is a ${documentType} document. `;
      const prompt = documentTypePrompt + `Analyze this image and extract all data in a structured table format.
        If this is a tariff/bill document, look for columns like SI. No., Category/Procedure, and price classes.
        If this is a medical record, look for patient details, diagnosis, and treatment information.
        Group similar information together and maintain the original structure.`;

      const response = await this.gemini.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        }
      ]);

      const getPromptForDocumentType = (documentType: string) => {
        const basePrompt = "Analyze this image and extract all data in a structured table format.";
        
        const prompts = {
          'Bills & Receipts': `${basePrompt} Look for columns like Item, Amount, Tax, Total. Extract all pricing information.`,
          'Medical Records': `${basePrompt} Look for patient details, procedures, ward information, and pricing details.`,
          'Investigation Reports': `${basePrompt} Look for test names, results, normal ranges, and remarks.`,
          'default': `${basePrompt} Extract all tabular data maintaining the original structure.`
        };
      
        return prompts[documentType] || prompts.default;
      };

      const processICURecords = (text) => {
        const lines = text.split('\n');
        return lines.map(line => {
          const [roomType, roomNumbers, charges] = line.split(/\s{2,}/);
          return {
            roomType: roomType?.trim() || '',
            roomNumbers: roomNumbers?.trim() || '',
            charges: charges?.trim() || '',
            nursingCharges: '', // Will be populated if found
          };
        });
      };

      const processScheduleCharges = (text) => {
        const lines = text.split('\n');
        return lines.map(line => {
          // Extract data from the image text with improved regex
          const matches = line.match(/(\d+)\s+([\w\s\-(),\/&.]+?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/);
          if (matches) {
            const [_, slNo, category, cClass, bClass, aClass] = matches;
            return {
              slNo: slNo.trim(),
              category: category.trim(),
              procedure: category.trim(), // Keep procedure same as category
              cClass: cClass.replace(/[,]/g, '').trim(),
              bClass: bClass.replace(/[,]/g, '').trim(),
              aClass: aClass.replace(/[,]/g, '').trim(),
              confidence_score: 0.8
            };
          }
          return null;
        }).filter(Boolean);
      };

      // Modify the response processing
      if (documentType === 'ICU Records') {
        const extractedText = response.text;
        parsedData = processICURecords(extractedText);
      } else {
        parsedData = response.text.split('\n').map((item, index) => {
          const [category, slNo, procedure, cClass, bClass, aClass] = item.split('|');
          return {
            category: category?.trim() || '',
            slNo: slNo?.trim() || '',
            procedure: procedure?.trim() || '',
            cClass: cClass?.trim() || '',
            bClass: bClass?.trim() || '',
            aClass: aClass?.trim() || '',
            confidence_score: calculateConfidence(item),
            bbox: calculateBoundingBox(item, index),
            original_data: item
          };
        });
      }

      return parsedData.map((item, index) => ({
        text: `${item.slNo}|${item.category}|${item.procedure}|${item.cClass}|${item.bClass}|${item.aClass}`,
        confidence_score: calculateConfidence(item),
        bbox: calculateBoundingBox(item, index),
        original_data: {
          slNo: item.slNo || '',
          category: item.category || '',
          procedure: item.procedure || '',
          cClass: item.cClass || '',
          bClass: item.bClass || '',
          aClass: item.aClass || ''
        }
      }));

    } catch (error) {
      retryCount++;
      if (retryCount === MAX_RETRIES) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
    }
  }
}