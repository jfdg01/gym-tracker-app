import './global.css';
import { StatusBar } from 'expo-status-bar';
import { Text, View, TextInput, TouchableOpacity, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { initDatabase, addItem, getItems } from './database';

export default function App() {
  const [items, setItems] = useState([]);
  const [text, setText] = useState('');

  useEffect(() => {
    initDatabase();
    refreshItems();
  }, []);

  const refreshItems = () => {
    const data = getItems();
    setItems(data);
  };

  const handleAddItem = () => {
    if (!text) return;
    addItem(text);
    setText('');
    refreshItems();
  };

  return (
    <View className="flex-1 bg-white pt-12 px-4">
      <Text className="text-2xl font-bold text-center mb-4">SQLite Gym Tracker</Text>

      <View className="flex-row mb-4">
        <TextInput
          className="flex-1 border border-gray-300 rounded p-2 mr-2"
          placeholder="Enter item name"
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity
          className="bg-blue-500 justify-center px-4 rounded"
          onPress={handleAddItem}
        >
          <Text className="text-white font-bold">Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="bg-gray-100 p-3 mb-2 rounded">
            <Text>{item.name}</Text>
          </View>
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
}