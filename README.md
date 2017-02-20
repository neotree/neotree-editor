## NeoTree Editor

### Configuration

Add file **src/config.jsx**
```
const devFirebaseConfig = {
    apiKey: "<FIREBASE DEV PROJECT KEY>",
    authDomain: "<FIREBASE DEV PROJECT ID>.firebaseapp.com",
    databaseURL: "https://<FIREBASE DEV PROJECT ID>.firebaseio.com",
    storageBucket: "<FIREBASE DEV PROJECT ID>.appspot.com"
};

const prodFirebaseConfig = {
    apiKey: "<FIREBASE PRODUCTION PROJECT KEY>",
    authDomain: "<FIREBASE PRODUCTION PROJECT ID>.firebaseapp.com",
    databaseURL: "https://<FIREBASE PRODUCTION PROJECT ID>.firebaseio.com",
    storageBucket: "<FIREBASE PRODUCTION PROJECT ID>.appspot.com",
};

export const firebaseConfig = (process.env.NODE_ENV === 'production') ? prodFirebaseConfig : devFirebaseConfig;
```

### Run the project dev mode
```
npm install (only once)
npm run dev
```

### Create signed distributable package (requires Apple Developer account)

#### CI/Development Environment Variables

| Variable                   | Description                                  | Required |
|----------------------------|----------------------------------------------|----------|
| CSC_LINK                   | Mac App - Developer ID certificate URL       | Yes      |
| CSC_KEY_PASSWORD           | Mac App - Developer ID password              | Yes      |
| CSC_INSTALLER_LINK         | Mac Installer - Developer ID certificate URL | No       |
| CSC_INSTALLER_KEY_PASSWORD | Mac Installer - Developer ID password        | No       |


```
npm run package
```