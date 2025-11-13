// Импортируем расширения jest-dom
import '@testing-library/jest-dom';

// Полностью мокаем React Native
jest.mock('react-native', () => {
  const React = require('react');
  
  const View = React.forwardRef(({ children, testID, style, ...props }, ref) => 
    React.createElement('div', { 
      'data-testid': testID, 
      style, 
      ref,
      ...props 
    }, children)
  );
  
  const Text = React.forwardRef(({ children, testID, style, ...props }, ref) => 
    React.createElement('span', { 
      'data-testid': testID, 
      style, 
      ref,
      ...props 
    }, children)
  );
  
  const TouchableOpacity = React.forwardRef(({ children, testID, style, onPress, disabled, ...props }, ref) => 
    React.createElement('button', { 
      'data-testid': testID, 
      style, 
      onClick: onPress,
      disabled,
      ref,
      ...props 
    }, children)
  );

  return {
    StyleSheet: {
      create: (styles) => styles,
      flatten: (style) => Array.isArray(style) ? Object.assign({}, ...style) : style,
      hairlineWidth: 1,
      absoluteFill: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    View,
    Text,
    TouchableOpacity,
    Platform: {
      OS: 'ios',
      select: (obj) => obj.ios || obj.default,
    },
    Animated: {
      Value: jest.fn(),
      timing: jest.fn(),
      spring: jest.fn(),
    },
  };
});

// Мокаем проблемные модули
jest.mock('@react-native/js-polyfills/error-guard', () => ({
  setGlobalHandler: jest.fn(),
}));

jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn(),
}));

global.__DEV__ = true;