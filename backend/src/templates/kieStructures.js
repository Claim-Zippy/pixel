// KIE JSON structures for different document types
module.exports = {
  // Hospital Tariff structure
  HOSPITAL_TARIFF: {
    structure: {
      hospitalName: null,
      effectiveDate: null,
      roomCharges: {
        general: null,
        private: null,
        icu: null
      },
      consultationFees: {
        specialist: null,
        resident: null
      }
      // Add more fields as needed
    }
  },

  // Prescription structure
  PRESCRIPTION: {
    structure: {
      doctorName: null,
      patientName: null,
      date: null,
      medications: [
        {
          name: null,
          dosage: null,
          frequency: null,
          duration: null
        }
      ]
      // Add more fields as needed
    }
  },

  // Lab Report structure
  LAB_REPORT: {
    structure: {
      patientDetails: {
        name: null,
        age: null,
        gender: null
      },
      testDate: null,
      testResults: [
        {
          testName: null,
          value: null,
          unit: null,
          referenceRange: null
        }
      ]
      // Add more fields as needed
    }
  },

  // Radiology Report structure
  RADIOLOGY_REPORT: {
    structure: {
      patientInfo: {
        name: null,
        id: null
      },
      examination: {
        type: null,
        date: null
      },
      findings: null,
      impression: null
      // Add more fields as needed
    }
  },

  // Bill structure
  BILL: {
    structure: {
      billNumber: null,
      date: null,
      patientDetails: {
        name: null,
        id: null
      },
      items: [
        {
          description: null,
          quantity: null,
          rate: null,
          amount: null
        }
      ],
      totalAmount: null
      // Add more fields as needed
    }
  }
}; 