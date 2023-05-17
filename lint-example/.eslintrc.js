
module.exports = {
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "plugin:react/recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "settings": {
        "react": {
            "version": "17.0.2"
        }
    },
    "plugins": [
        "react",
        "eslint-plugin-import",
    ],
    "rules": {
        "import/prefer-default-export": ["error", {"target":"any"}],
        "no-undef": "error",
    }
}
