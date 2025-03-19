const fs = require('fs').promises;

class OpenAIService {
  constructor() {
    // Make sure the model is properly initialized
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const apiKey = process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        console.error('GEMINI_API_KEY is not set in environment variables');
        throw new Error('API key not configured');
      }
      
      const genAI = new GoogleGenerativeAI(apiKey);
      this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      console.log('Gemini model initialized successfully');
    } catch (error) {
      console.error('Error initializing Gemini model:', error);
      // Don't throw here, as it would crash the server immediately
      // Just mark this instance as having failed initialization
      this.initializationFailed = true;
    }
  }

  async imageToBase64(imagePath) {
    const imageBuffer = await fs.readFile(imagePath);
    return imageBuffer;
  }

  async extractTextFromImage(imagePath, documentType) {
    const MAX_RETRIES = 3;
    let retryCount = 0;
    
    while (retryCount < MAX_RETRIES) {
      try {
        // Check if initialization failed
        if (this.initializationFailed || !this.model) {
          throw new Error('Gemini model not properly initialized');
        }
        
        // Read image file
        let imageBuffer;
        try {
          imageBuffer = await fs.readFile(imagePath);
          console.log('Image loaded successfully:', imagePath);
        } catch (fileError) {
          console.error('Error reading image file:', fileError);
          throw new Error(`Failed to read image file: ${fileError.message}`);
        }

        // Convert image to base64 for the newer Gemini model
        const base64Image = imageBuffer.toString('base64');
        
        // Enhance the prompt to get structured JSON data
        const prompt = `Analyze this hospital tariff image and extract all data in a structured table format. 
        The table has columns for SI. No., Category/Procedure, C Class General Ward, B Class Non A/c & A/c Twin sharing, A Class Single A/c.
        
        For each row in the table, extract:
        1. The SI. No.
        2. The Category/Procedure name
        3. The C Class price
        4. The B Class price
        5. The A Class price
        
        Format the response as a clean JSON array where each object represents a row:
        [
          {
            "slNo": "1",
            "procedure": "Some Procedure",
            "cClass": "₹1000",
            "bClass": "₹2000",
            "aClass": "₹3000"
          },
          {
            "slNo": "2",
            "procedure": "Another Procedure",
            "cClass": "₹1500", 
            "bClass": "₹2500",
            "aClass": "₹3500"
          }
        ]
        
        ONLY provide the JSON array with no additional explanation or text.`;

        // Generate content with the new model
        const response = await this.model.generateContent({
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                { 
                  inlineData: {
                    mimeType: "image/jpeg",
                    data: base64Image
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 4096,
          }
        });

        const responseText = response.response.text();
        console.log('Gemini response received, length:', responseText.length);
        
        // Parse and return more structured data
        try {
          // Extract JSON from the response
          let jsonString = responseText;
          const startIdx = responseText.indexOf('[');
          const endIdx = responseText.lastIndexOf(']') + 1;
          
          if (startIdx >= 0 && endIdx > startIdx) {
            jsonString = responseText.substring(startIdx, endIdx);
          }
          
          const parsedData = JSON.parse(jsonString);
          
          if (!Array.isArray(parsedData)) {
            throw new Error('Parsed data is not an array');
          }
          
          console.log(`Successfully parsed ${parsedData.length} rows of data`);
          
          // Convert to the expected format with bounding boxes and confidence scores
          const calculateConfidence = (item) => {
            let score = 0;
            
            // Remove the ₹ symbol and any commas from price values
            const cleanPrice = (price) => price?.replace(/[₹,]/g, '') || '';
            
            // Check for presence and format validity of each field
            if (item.slNo && !isNaN(item.slNo)) score += 0.15;
            if (item.procedure && item.procedure.length > 3) score += 0.15;
            
            // Validate price fields
            const cPrice = parseFloat(cleanPrice(item.cClass));
            const bPrice = parseFloat(cleanPrice(item.bClass));
            const aPrice = parseFloat(cleanPrice(item.aClass));
            
            if (!isNaN(cPrice)) score += 0.15;
            if (!isNaN(bPrice)) score += 0.15;
            if (!isNaN(aPrice)) score += 0.15;
            
            // Check price progression logic (B > C and A > B)
            if (!isNaN(cPrice) && !isNaN(bPrice) && bPrice > cPrice) score += 0.125;
            if (!isNaN(bPrice) && !isNaN(aPrice) && aPrice > bPrice) score += 0.125;
            
            return Math.min(score, 1); // Cap at 1.0
          };

          return parsedData.map((item, index) => {
            const confidence = calculateConfidence(item);
            
            const text = `${item.procedure || ''}|${item.slNo || ''}|${item.procedure || ''}|${item.cClass || ''}|${item.bClass || ''}|${item.aClass || ''}`;
            
            return {
              text,
              confidence_score: confidence,
              bbox: [[10, 20 + (index * 30)], [400, 20 + (index * 30)], [400, 45 + (index * 30)], [10, 45 + (index * 30)]],
              original_data: item
            };
          });
        } catch (parseError) {
          console.error('Failed to parse Gemini response:', parseError, 'Response:', responseText);
          
          // Return a more structured error response
          return [{
            text: "|1|API Response Parsing Error|0|0|0",
            confidence_score: 0.1,
            bbox: [[0, 0], [100, 0], [100, 100], [0, 100]],
            original_response: responseText
          }];
        }
      } catch (error) {
        retryCount++;
        console.error(`Gemini API Error (Attempt ${retryCount}/${MAX_RETRIES}):`, error);
        
        if (retryCount < MAX_RETRIES) {
          // Add exponential backoff
          const delay = 1000 * Math.pow(2, retryCount);
          console.log(`Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          // Final failure, return error response
          return [{
            text: "|Error|" + error.message + "|0|0|0",
            confidence_score: 0.1,
            bbox: [[0, 0], [100, 0], [100, 100], [0, 100]]
          }];
        }
      }
    }
  }
}

// Export an instance of the class
module.exports = OpenAIService; 