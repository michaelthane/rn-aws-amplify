import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Pressable,
  SafeAreaView
} from 'react-native';
import { generateClient } from 'aws-amplify/api';
import { createTodo } from '../graphql/mutations';
import { listTodos } from '../graphql/queries';

import { Amplify } from 'aws-amplify';
import amplifyconfig from '../amplifyconfiguration.json';
Amplify.configure(amplifyconfig);

const initialState = { name: '', description: '' };
const client = generateClient();

export default function TodoScreen({route}) {
  const [formState, setFormState] = useState(initialState);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    fetchTodos();
  }, []);

  function setInput(key, value) {
    setFormState({ ...formState, [key]: value });
  }

  async function fetchTodos() {
    try {
      const todoData = await client.graphql({
        query: listTodos
      });
      const todos = todoData.data.listTodos.items;
      setTodos(todos);
    } catch (err) {
      console.log('error fetching todos');
    }
  }

  async function addTodo() {
    try {
      if (!formState.name || !formState.description) return;
      const todo = { ...formState };
      setTodos([...todos, todo]);
      setFormState(initialState);
      await client.graphql({
        query: createTodo,
        variables: {
          input: todo
        }
      });
    } catch (err) {
      console.log('error creating todo:', err);
    }
  }

  return (
      <SafeAreaView>
        <View style={styles.container}>
          <TextInput
            onChangeText={val => setInput('name', val)}
            style={styles.input}
            value={formState.name}
            placeholder="Name"
          />
          <TextInput
            onChangeText={val => setInput('description', val)}
            style={styles.input}
            value={formState.description}
            placeholder="Description"
          />
          <Pressable onPress={addTodo} style={styles.buttonContainer}>
            <Text style={styles.buttonText}>Create Todo</Text>
          </Pressable>
          {todos.map((todo, index) => (
            <View key={todo.id ? todo.id : index} style={styles.todo}>
              <Text style={styles.todoName}>{todo.name}</Text>
              <Text>{todo.description}</Text>
            </View>
          ))}
        </View>
      </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { width: 400, flex: 1, padding: 20, alignSelf: 'center' },
  todo: { marginBottom: 15 },
  input: {
    backgroundColor: '#ddd',
    marginBottom: 10,
    padding: 8,
    fontSize: 18
  },
  todoName: { fontSize: 20, fontWeight: 'bold' },
  buttonContainer: {
    alignSelf: 'center',
    backgroundColor: 'black',
    paddingHorizontal: 8
  },
  buttonText: { color: 'white', padding: 16, fontSize: 18 }
});