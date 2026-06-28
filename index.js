import { registerRootComponent } from 'expo';
import { registerWidgetTaskHandler } from 'react-native-android-widget';

import App from './App';
import { widgetTaskHandler } from './src/widget/widgetTaskHandler';

// Register the main app
registerRootComponent(App);

// Register the Android widget background task handler.
// This runs even when the app UI is not open, so the widget can refresh
// and handle the heart-button tap.
registerWidgetTaskHandler(widgetTaskHandler);
