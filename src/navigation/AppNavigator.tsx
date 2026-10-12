import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {RootStackParamList} from '../types';

import HomeScreen from '../screens/HomeScreen';
import TemplateEditorScreen from '../screens/TemplateEditorScreen';
import TemplateListScreen from '../screens/TemplateListScreen';
import ImportExcelScreen from '../screens/ImportExcelScreen';
import PreviewScreen from '../screens/PreviewScreen';
import SendProgressScreen from '../screens/SendProgressScreen';
import SmtpSettingsScreen from '../screens/SmtpSettingsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="TemplateEditor" component={TemplateEditorScreen} />
        <Stack.Screen name="TemplateList" component={TemplateListScreen} />
        <Stack.Screen name="ImportExcel" component={ImportExcelScreen} />
        <Stack.Screen name="Preview" component={PreviewScreen} />
        <Stack.Screen name="SendProgress" component={SendProgressScreen} />
        <Stack.Screen name="SmtpSettings" component={SmtpSettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
