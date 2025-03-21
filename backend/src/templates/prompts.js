// GPT prompts for different document types
module.exports = {
  HOSPITAL_TARIFF: {
    system: "You are a medical document analysis expert specializing in hospital tariff sheets. Your task is to extract structured information from hospital tariff documents and match them with standardized codes and categories.",
    user: "Analyze this hospital tariff image and extract information according to the provided structure, including confidence scores and bounding boxes for each extracted item.",
    prompt: "Extract information from this hospital tariff document and format it according to the following structure. Include confidence scores and bounding boxes for each identified item.",
    outputStructure: {
      _id: "AUTOGENERATED",
      total_page_count: 0,
      pages: [
        {
          _id: "AUTOGENERATED",
          page_num: 0,
          title: "",
          date: "ISO_DATE_STRING",
          classification: {
            type: "string",
            enum: ["soc", "mini_soc", "other"],
            description: "Document classification type"
          },
          linked_page_count: 0,
          rows_count: 0,
          subtotal_page: false,
          rows: [
            {
              _id: "AUTOGENERATED",
              hospital_billable_code: "",
              billable_item: "",
              oz_billable_code: "",
              oz_billable_item: "",
              oz_billable_item_rate_min: null,
              oz_billable_item_rate_max: null,
              oz_billable_item_match_score: {
                type: "number",
                minimum: 0,
                maximum: 1
              },
              chargehead: "",
              chargehead_id: "",
              unit_rate: 0,
              currency: "INR",
              currency_sym: "₹",
              discount: null,
              discount_type: {
                type: "string",
                enum: ["p_cent", "absolute"]
              },
              hsn_code: null,
              date: "ISO_DATE_STRING",
              is_medical: false,
              is_admissible: false,
              ocr_quality: {
                type: "number",
                minimum: 0,
                maximum: 1
              },
              ocr_bounding_box: {
                type: "array",
                items: {
                  type: "number"
                },
                minItems: 8,
                maxItems: 8,
                description: "Coordinates [x1,y1,x2,y2,x3,y3,x4,y4]"
              }
            }
          ],
          additional_info: {
            type: "object",
            description: "Any additional information not fitting in the standard rows structure"
          }
        }
      ]
    },
    referenceData: {
      oz_billable_items: [
        {
          oz_billable_code: "string",
          oz_billable_item: "string",
          oz_billable_item_rate_min: "number",
          oz_billable_item_rate_max: "number",
          oz_chargehead: "string"
        }
      ],
      chargehead_list: [
        {
          chargehead: "string",
          _id: "string"
        }
      ]
    },
    instructions: [
      "Extract text with confidence scores and bounding boxes.",
      "Match billable items with oz_billable_items using fuzzy matching",
      "Assign the closest matching chargehead from chargehead_list",
      "Calculate match scores based on text similarity",
      "Determine medical/admissible status based on item description",
      "Include any non-standard information in additional_info"
    ]
  },

  PRESCRIPTION: {
    system: "You are a medical document analysis expert specializing in medical prescriptions.",
    user: "Please analyze this prescription and extract all medication details, dosage instructions, and patient information according to the provided structure."
  },

  LAB_REPORT: {
    system: "You are a medical document analysis expert specializing in laboratory reports.",
    user: "Please analyze this lab report and extract all test results, reference ranges, and patient information according to the provided structure."
  },

  RADIOLOGY_REPORT: {
    system: "You are a medical document analysis expert specializing in radiology reports.",
    user: "Please analyze this radiology report and extract the examination details, findings, and impression according to the provided structure."
  },

  BILL: {
    system: "You are a medical document analysis expert specializing in medical bills.",
    user: "Please analyze this medical bill and extract all itemized charges, patient details, and total amounts according to the provided structure."
  }
}; 