try {
    require('dotenv').config({ path: '.env.local', });
} catch(e) {
    // do nothing
}

try {
    require('dotenv').config({ path: '.env.development', });
} catch(e) {
    // do nothing
} finally {
    require('dotenv/config');
}
