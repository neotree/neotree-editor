const devFirebaseConfig = {
    apiKey: "AIzaSyCe790PMoNwBE3X5QkRLiZCeIB7TseRc9w",
    authDomain: "neotree-test.firebaseapp.com",
    databaseURL: "https://neotree-test.firebaseio.com",
    storageBucket: "neotree-test.appspot.com"
};

const prodFirebaseConfig = {
    apiKey: "AIzaSyCe790PMoNwBE3X5QkRLiZCeIB7TseRc9w",
    authDomain: "neotree-test.firebaseapp.com",
    databaseURL: "https://neotree-test.firebaseio.com",
    storageBucket: "neotree-test.appspot.com",
};

export const firebaseConfig = (process.env.NODE_ENV === 'production') ? prodFirebaseConfig : devFirebaseConfig;
