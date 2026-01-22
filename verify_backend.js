
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAO6Nyba91WjGvy-Rs-SKvmiWzpflQ7W3U",
    authDomain: "trust-market-platform.firebaseapp.com",
    projectId: "trust-market-platform",
    storageBucket: "trust-market-platform.firebasestorage.app",
    messagingSenderId: "516223323976",
    appId: "1:516223323976:web:834ff2d8590b770d0b2d7d",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const jobData = {
    title: 'Senior React Native Developer',
    description: 'We are looking for a visionary developer to lead our engineering team. MUST know Expo and Firebase.',
    price: '₹ 15L - 30L',
    category: 'Jobs',
    images: ['https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=1000'],
    sellerId: 'verification_test_user',
    sellerName: 'Leo (Test)',
    rating: 5,
    type: 'job',
    location: 'Kochi, Kerala',
    jobType: 'Full Time',
    salaryRange: '₹ 15L - 30L',
    skills: ['React Native', 'Expo', 'Firebase', 'TypeScript'],
    experienceLevel: 'Senior',
    companyName: 'Vendo Labs',
    workMode: 'Onsite',
    enableChat: true,
    status: 'active',
    views: 0,
    chatsCount: 0,
    createdAt: new Date()
};

async function postJob() {
    try {
        console.log('⏳ Posting job to Firestore...');
        const docRef = await addDoc(collection(db, 'listings'), jobData);
        console.log('✅ Job posted successfully! Document ID:', docRef.id);
        process.exit(0);
    } catch (error) {
        console.error('❌ Error posting job:', error);
        process.exit(1);
    }
}

postJob();
