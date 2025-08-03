# TypeMate Production Functional Test Report
**Generated**: 2025-08-03T14:54:25.042Z

## Summary
- **Status**: FAIL
- **Success Rate**: 33%
- **Tests**: 1/3 passed
- **Critical Issues**: 10

## Test Results


### Authentication Flow
- **Status**: ✅ PASSED
- **Duration**: 2514ms
- **Message**: Authentication bypass successful for testing



### Chat Function
- **Status**: ❌ FAILED
- **Duration**: 4868ms
- **Message**: No message
- **Issues**: 
    - Chat input field not visible
  - Chat function failed: Chat input field not found


### Settings Page
- **Status**: ❌ FAILED
- **Duration**: 6749ms
- **Message**: No message
- **Issues**: 
    - No settings content found
  - Current URL: http://localhost:3000/settings
  - Body content preview: 設定を読み込み中......
  - Settings page failed: Settings page content not loaded


## Critical Issues

- **Type**: console_error
- **Test**: Unknown
- **Message**: Failed to load resource: the server responded with a status of 404 (Not Found)
- **Time**: 2025-08-03T14:54:11.140Z


- **Type**: console_error
- **Test**: Unknown
- **Message**: Failed to load resource: the server responded with a status of 404 (Not Found)
- **Time**: 2025-08-03T14:54:14.992Z


- **Type**: console_error
- **Test**: Unknown
- **Message**: Failed to load resource: the server responded with a status of 400 ()
- **Time**: 2025-08-03T14:54:15.802Z


- **Type**: console_error
- **Test**: Unknown
- **Message**: ❌ Conversation messages fetch error: {code: 22P02, details: null, hint: null, message: invalid input syntax for type uuid: "temp"}
- **Time**: 2025-08-03T14:54:15.802Z


- **Type**: console_error
- **Test**: Unknown
- **Message**: Failed to load resource: the server responded with a status of 400 ()
- **Time**: 2025-08-03T14:54:15.861Z


- **Type**: console_error
- **Test**: Unknown
- **Message**: ❌ Conversation messages fetch error: {code: 22P02, details: null, hint: null, message: invalid input syntax for type uuid: "temp"}
- **Time**: 2025-08-03T14:54:15.861Z


- **Type**: chat_functionality_failure
- **Test**: Chat Function
- **Message**: Chat input field not found
- **Time**: undefined


- **Type**: console_error
- **Test**: Unknown
- **Message**: Failed to load resource: the server responded with a status of 404 (Not Found)
- **Time**: 2025-08-03T14:54:19.711Z


- **Type**: console_error
- **Test**: Unknown
- **Message**: Settings initialization error: ReferenceError: user is not defined
    at SettingsPage.useEffect.initializeSettings (webpack-internal:///(app-pages-browser)/./src/app/settings/page.tsx:354:35)
    at SettingsPage.useEffect (webpack-internal:///(app-pages-browser)/./src/app/settings/page.tsx:461:13)
    at Object.react_stack_bottom_frame (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:23638:20)
    at runWithFiberInDEV (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:873:30)
    at commitHookEffectListMount (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12296:29)
    at commitHookPassiveMountEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:12417:11)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14514:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14561:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14561:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14561:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14561:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14561:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14561:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14561:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14561:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14561:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
    at reconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14507:11)
    at recursivelyTraverseReconnectPassiveEffects (webpack-internal:///(app-pages-browser)/./node_modules/next/dist/compiled/react-dom/cjs/react-dom-client.development.js:14485:9)
- **Time**: 2025-08-03T14:54:20.038Z


- **Type**: settings_page_failure
- **Test**: Settings Page
- **Message**: Settings page content not loaded
- **Time**: undefined


## Recommendations

🚨 **Immediate Action Required**

- Fix Chat Function: Chat input field not visible

- Fix Settings Page: No settings content found



---
*Generated by TypeMate Production Functional Tester*
