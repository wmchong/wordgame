import { useNavigation } from '@react-navigation/core'
import { StyleSheet, SafeAreaView, View, Dimensions, Text} from 'react-native';
import React, { useEffect, useState } from 'react'
import Leaderboard from '../index.js';
import { auth } from '../firebase'
import { ref, set, onValue, update } from 'firebase/database'
import { db } from '../firebase'

const LeaderboardScreen = () => {
  const [uid, setUid] = useState('')
  const [username, setUsername] = useState('')
  const [score, setScore] = useState('');
  const [rank, setRank] = useState([]);
  const [data, setData] = useState([]);

  useEffect(() => {
    return onValue(ref(db, '/users'), snapshot => {
      let data = snapshot.val();

      const user = auth.currentUser;
      setUsername(data[user.uid].username);
      setScore(data[user.uid].score);
      organiseList(data);
    });
  }, []);

  var temp=[];

  const organiseList = (list) => {
    for (var i in list) {
      temp.push({
        userName: list[i].username,
        highScore: list[i].score,
      });
    }
    setRank(temp);
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.userscoreView}>
        <Text style={styles.usernameText}>{username}</Text>
        <Text style={styles.highscoreText}>{score}</Text>
      </View>
      <Leaderboard
        data={rank}
        sortBy='highScore'
        labelBy='userName'
        oddRowColor='white'
        evenRowColor='#F8F0E3'/>
    </SafeAreaView>
  );
}

export default LeaderboardScreen

const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink',
  },

  userscoreView: {
    flexDirection: 'row',
    backgroundColor: '#7DF9FF',
    width: windowWidth - 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    height: 50,
    margin:10,
  },

  usernameText: {
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
    alignItems: 'flex-start',
  },

  highscoreText: {
    padding: 10,
    fontSize: 20,
    fontWeight: 'bold',
  },
})
