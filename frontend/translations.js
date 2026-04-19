const translations = {
    'EN': {
        'nav_home': 'Home',
        'nav_bank_sync': 'Bank Sync',
        'nav_support': 'Support',
        'nav_features': 'Features',
        'nav_about': 'About',
        'hero_title': 'Take Control of Your <br>Financial Future',
        'hero_subtitle': 'A smart, intuitive, and beautiful way to track your expenses, manage your budget, and grow your wealth. All in one secure place.',
        'btn_start_free': 'Start Tracking for Free',
        'btn_how_it_works': 'How it Works'
    },
    'HI': {
        'nav_home': 'मुख्य पृष्ठ',
        'nav_bank_sync': 'बैंक सिंक',
        'nav_support': 'सहायता',
        'nav_features': 'विशेषताएं',
        'nav_about': 'हमारे बारे में',
        'hero_title': 'अपने वित्तीय भविष्य पर <br>नियंत्रण रखें',
        'hero_subtitle': 'अपने खर्चों को ट्रैक करने, अपना बजट प्रबंधित करने और अपनी संपत्ति बढ़ाने का एक स्मार्ट, सहज और सुंदर तरीका। सब एक सुरक्षित स्थान पर।',
        'btn_start_free': 'मुफ्त में ट्रैकिंग शुरू करें',
        'btn_how_it_works': 'यह कैसे काम करता है'
    },
    'TA': {
        'nav_home': 'முகப்பு',
        'nav_bank_sync': 'வங்கி ஒத்திசைவு',
        'nav_support': 'ஆதரவு',
        'nav_features': 'அம்சங்கள்',
        'nav_about': 'எங்களைப் பற்றி',
        'hero_title': 'உங்கள் நிதி எதிர்காலத்தை <br>கட்டுப்படுத்துங்கள்',
        'hero_subtitle': 'உங்கள் செலவுகளைக் கண்காணிக்கவும், உங்கள் பட்ஜெட்டை நிர்வகிக்கவும் மற்றும் உங்கள் செல்வத்தை வளர்க்கவும் ஒரு ஸ்மார்ட், உள்ளுணர்வு மற்றும் அழகான வழி. அனைத்தும் ஒரே பாதுகாப்பான இடத்தில்.',
        'btn_start_free': 'இலவசமாக கண்காணிக்கத் தொடங்குங்கள்',
        'btn_how_it_works': 'இது எப்படி வேலை செய்கிறது'
    }
};

function applyTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang] && translations[lang][key]) {
            el.innerHTML = translations[lang][key];
        }
    });
    localStorage.setItem('preferredLang', lang);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('preferredLang') || 'EN';
    const picker = document.querySelector('.lang-picker select');
    if (picker) {
        picker.value = savedLang;
    }
    applyTranslations(savedLang);
});
