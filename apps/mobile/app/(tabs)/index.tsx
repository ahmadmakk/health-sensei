import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, FlatList, TextInput, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useMealsStore } from '../../src/hooks/useMeals';
import { useUserInfo } from '../../src/hooks/useUserInfo';
import { startFoodConversation, continueConversation, generateFinalAnalysis } from '../../src/services/conversationalFoodService';
import { analyzeImage } from '../../src/services/foodAnalysisService';

export default function KitchenScreen() {
  const { loadMeals, addMeal } = useMealsStore();
  const { userInfo } = useUserInfo();

  const [conversation, setConversation] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => { loadMeals(); }, []);

  const startChat = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const conv = await startFoodConversation(input, userInfo?.goals?.includes('lose_weight') ? 'lose_weight' : 'maintain');
      setConversation(conv);
      setMessages(conv.messages || [{ id: '1', role: 'assistant', content: 'Started' }]);

      if (conv.status === 'ready_to_analyze') {
        await analyzeAndAdd(conv);
      }

    } catch (e) { console.warn(e); }
    setLoading(false);
    setInput('');
  };

  const handlePhotoPick = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Permission to access photos is required to analyze images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, base64: true, quality: 0.6 });
      if (result.cancelled) return;
      setLoading(true);
      const base64 = result.base64 ? `data:image/jpeg;base64,${result.base64}` : null;
      if (!base64) throw new Error('No image data');

      const analyzed = await analyzeImage(base64, userInfo?.goals?.includes('lose_weight') ? 'lose_weight' : 'maintain');
      // add as meal
      await addMeal({ date: new Date().toISOString().split('T')[0], items: [analyzed], notes: undefined });
      setMessages(prev => [...prev, { id: String(Date.now()), role: 'assistant', content: `Added ${analyzed.name} (${analyzed.calories} cal)` }]);

    } catch (e) {
      console.warn('Photo analysis failed', e);
      Alert.alert('Analysis failed', 'Could not analyze the photo. Try a different image or manual entry.');
    } finally {
      setLoading(false);
    }
  };

  const sendFollowUp = async (text: string) => {
    if (!conversation) return;
    setLoading(true);
    try {
      const updated = await continueConversation(conversation, text, userInfo?.goals?.includes('lose_weight') ? 'lose_weight' : 'maintain');
      setConversation(updated);
      setMessages(updated.messages || []);
      if (updated.status === 'ready_to_analyze') {
        await analyzeAndAdd(updated);
      }
    } catch (e) { console.warn(e); }
    setLoading(false);
  };

  const analyzeAndAdd = async (conv: any) => {
    setLoading(true);
    try {
      const analyzed = await generateFinalAnalysis(conv, userInfo?.goals?.includes('lose_weight') ? 'lose_weight' : 'maintain');
      // add as meal
      await addMeal({ date: new Date().toISOString().split('T')[0], items: [analyzed], notes: undefined });
      setMessages(prev => [...prev, { id: String(Date.now()), role: 'assistant', content: `Added ${analyzed.name} (${analyzed.calories} cal)` }]);
      setConversation(prev => prev ? { ...prev, status: 'completed' } : prev);
    } catch (e) { console.warn(e); }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Kitchen</Text>
      <Text style={{ marginBottom: 8 }}>Hello {userInfo.name ?? 'Guest'}</Text>

      <View style={styles.actionsRow}>
        <Button title="Pick Photo" onPress={handlePhotoPick} />
        <Button title="Take Photo" onPress={handleCameraCapture} />
      </View>

      <View style={styles.chatBox}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={{ marginVertical: 6 }}>
              <Text style={{ fontWeight: item.role === 'user' ? '700' : '500' }}>{item.role === 'user' ? 'You' : 'AI'}</Text>
              <Text>{item.content}</Text>
            </View>
          )}
        />
      </View>

      <View style={styles.inputRow}>
        <TextInput value={input} onChangeText={setInput} placeholder="Type food name (e.g., 'Whopper')" style={styles.input} />
        <Button title="Send" onPress={startChat} />
      </View>

      {loading && <ActivityIndicator style={{ marginTop: 12 }} />}

    </View>
  );
}

const styles = StyleSheet.create({
  chatBox: { flex: 1, marginBottom: 12, backgroundColor: '#f8fafc', padding: 8, borderRadius: 8 },
  inputRow: { flexDirection: 'row', gap: 8, alignItems: 'center' as const },
  input: { flex: 1, borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 8, marginRight: 8 }
});
