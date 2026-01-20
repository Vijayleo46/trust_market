import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Text,
} from 'react-native';
import { 
  Home, 
  Search, 
  Plus, 
  MessageCircle, 
  User 
} from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeContext';

const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 88 : 64;

interface TabItem {
  name: string;
  icon: React.ComponentType<any>;
  onPress: () => void;
}

interface SimpleWorkingTabBarProps {
  tabs: TabItem[];
  activeIndex: number;
  onTabPress: (index: number) => void;
}

export const SimpleWorkingTabBar: React.FC<SimpleWorkingTabBarProps> = ({
  tabs,
  activeIndex,
  onTabPress,
}) => {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: '#FFFFFF' }]}>
      {/* Tab Items */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab, index) => {
          const isActive = activeIndex === index;
          const IconComponent = tab.icon;
          
          return (
            <TouchableOpacity
              key={`tab-${index}`}
              activeOpacity={0.7}
              onPress={() => {
                console.log(`Tab ${index} (${tab.name}) pressed!`);
                onTabPress(index);
              }}
              style={[
                styles.tabContainer,
                isActive && { 
                  backgroundColor: '#7C3AED',
                  borderRadius: 20,
                }
              ]}
            >
              <IconComponent
                size={24}
                color={isActive ? '#FFFFFF' : '#6B7280'}
                strokeWidth={2}
              />
              <Text style={[
                styles.tabLabel,
                { 
                  color: isActive ? '#FFFFFF' : '#6B7280',
                  fontWeight: isActive ? '600' : '400'
                }
              ]}>
                {tab.name.replace('Tab', '')}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: TAB_BAR_HEIGHT,
    zIndex: 9999,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    paddingTop: 8,
    paddingHorizontal: 8,
  },
  tabContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginHorizontal: 4,
    paddingVertical: 8,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
});