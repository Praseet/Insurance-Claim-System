const Tesseract = require('tesseract.js');
const path = require('path');

const performOCR = async (imagePath) => {
  try {
    console.log(`Performing OCR on: ${imagePath}`);
    
    const result = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: info => {
          if (info.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(info.progress * 100)}%`);
          }
        }
      }
    );

    return {
      text: result.data.text,
      data: {
        confidence: result.data.confidence,
        words: result.data.words?.length || 0
      }
    };
  } catch (error) {
    console.error('OCR Error:', error);
    return {
      text: '',
      data: { error: error.message }
    };
  }
};

module.exports = { performOCR };
