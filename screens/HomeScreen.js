import { useNavigation } from '@react-navigation/core'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Button, Alert, Modal, Image, Animated, Dimensions, Pressable } from 'react-native';
import { auth } from '../firebase'
import { ref, set, onValue, update } from 'firebase/database'
import { db } from '../firebase'
import * as Speech from 'expo-speech';
import { useIsFocused } from '@react-navigation/native';
import {puzzleList} from '../wordPuzzle'

const HomeScreen = () => {
  const [uid, setUid] = useState('')
  const [username, setUsername] = useState('')
  const [score, setScore] = useState('')
  const navigation = useNavigation()

  let list = puzzleList;

  const isFocused = useIsFocused();

  useEffect(() => {
    return onValue(ref(db, '/users'), snapshot => {
      let data = snapshot.val();
      const user = auth.currentUser;
      setUsername(data[user.uid].username);
      setScore(data[user.uid].score);
      setUid(user.uid);
    });
  }, []);

  React.useEffect(()=>{
   if(isFocused){
     setStartGameModalVisible(true);
     setCurrentScore(0);
     setCount(0);
     list = list.sort(() => Math.random() - 0.5);
     gameEngine('★'); // to skip the firstpuzzle
     console.log(list);

   }
  },[isFocused])

  const handleLeaderboardStart = () => {
    setStartGameModalVisible(!startGameModalVisible);
    navigation.navigate('Leaderboard');
  }

  const handleSignOut = () => {
    auth
      .signOut()
      .then(() => {
        navigation.replace("Login")
      })
      .catch(error => alert(error.message))
  }

  // puzzle, answer, count and score variable
  const [puzzle, setPuzzle] = useState(list[0].puzzle);
  const [answer, setAnswer] = useState(list[0].answer);
  const [count, setCount] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);

  // textinput variable
  const [text, onChangeText] = useState(text);

  // handle the visibility of the modals
  const [correctModalVisible, setCorrectModalVisible] = useState(false);

  const [incorrectModalVisible, setIncorrectModalVisible] = useState(false);

  const [endModalVisible, setEndModalVisible] = useState(false);

  const [endGameModalVisible, setEndGameModalVisible] = useState(false);

  const [startGameModalVisible, setStartGameModalVisible] = useState(false);

  const points = 10;

  // game engine
  const gameEngine = (textInput) => {
    if (textInput != null) {
      try {
        if (count > list.length) {
          setEndModalVisible(true);
        } else {
          if (textInput.toLowerCase() == answer.toLowerCase()) {
            let newCount = count + 1;
            setCount(newCount);
            let newCurrentScore = currentScore + points;
            setCurrentScore(newCurrentScore);
            let p = list[count].puzzle;
            let a = list[count].answer;
            setPuzzle(p);
            setAnswer(a);
            setCorrectModalVisible(true);
          } else if (textInput == '★') {
            setCount(count + 1);
            let p = list[count].puzzle;
            let a = list[count].answer;
            setPuzzle(p);
            setAnswer(a);
          } else {
            setIncorrectModalVisible(true);
          }
        }
      } catch(err) {
        console.log(err)
      }
    }
  }

  // text to speech function
  const speak = () => {
    Speech.speak(puzzle);
  };

  const updateScore = (newScore) => {
    update(ref(db, 'users/' + uid), {
      score: newScore,
    })
    .catch((error) => {
      alert(error);
    });
  }

  // handle end of game situations
  const endGame = () => {
    setEndGameModalVisible(true);
    if (currentScore > score) {
      setScore(currentScore);
      updateScore(currentScore);
    }
  }

  const correctEndGame = () => {
    endGame();
    setCorrectModalVisible(!correctModalVisible);
  }

  const incorrectEndGame = () => {
    endGame();
    setIncorrectModalVisible(!incorrectModalVisible);
  }

  const closeEndSummary = () => {
    setCurrentScore(0);
    setCount(0);
    list = list.sort(() => Math.random() - 0.5);
    setEndGameModalVisible(!endGameModalVisible);
  }


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.puzzlebox}>
        <View style={styles.reverseRow}>
          <TouchableOpacity style={styles.signOut} onPress={handleSignOut}>
            <Image
              source = {require('../assets/logout.png')}
              style={styles.signOutImage}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.leaderBoard} onPress={() => {navigation.navigate('Leaderboard')}}>
            <Image
              source = {require('../assets/leadership.png')}
              style={styles.leaderBoardImage}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.puzzleBackground}>
          <Text style={styles.puzzleText}>{puzzle}</Text>
        </View>
        <View style={styles.reverseRow}>
          <TouchableOpacity style={styles.marginRight20} onPress={speak}>
            <Image
              source = {require('../assets/speaker.png')}
              style={styles.speakerImage}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.marginRight20} onPress={() => gameEngine('★')}>
            <Image
              source = {require('../assets/skip.png')}
              style={styles.skipImage}
            />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.input}
          placeholder="Type your answer here!"
          underlineColorAndroid="transparent"
          blurOnSubmit={false}
          autoFocus={false}
          autoCorrect={false}
          autoCapitalize="none"
          keyboardType="default"
          returnKeyType="next"
          onChangeText={onChangeText}
          value={text}
        />

        <TouchableOpacity style={styles.enter} onPress={() => gameEngine(text)}>
            <Text style={styles.enterText}>Enter</Text>
        </TouchableOpacity>

        <View style={styles.centeredView}>
          {/* Correct Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={correctModalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setCorrectModalVisible(!correctModalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Well done!</Text>
                <View style={styles.buttonView}>
                  <Pressable
                    style={[styles.button, styles.buttonEnd]}
                    onPress={() => correctEndGame()}
                  >
                    <Text style={styles.textStyle}>End</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.buttonAgain]}
                    onPress={() => setCorrectModalVisible(!correctModalVisible)}
                  >
                    <Text style={styles.textStyle}>Next</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.centeredView}>
          {/* Incorrect Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={incorrectModalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setIncorrectModalVisible(!incorrectModalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Try again!</Text>
                <View style={styles.buttonView}>
                  <Pressable
                    style={[styles.button, styles.buttonEnd]}
                    onPress={() => incorrectEndGame()}
                  >
                  {/* if end send the username and score to firebase */}
                    <Text style={styles.textStyle}>End</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.button, styles.buttonAgain]}
                    onPress={() => setIncorrectModalVisible(!incorrectModalVisible)}
                  >
                    <Text style={styles.textStyle}>Try Again</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.centeredView}>
          {/* End of puzzle Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={endModalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setEndModalVisible(!endModalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Finshed all word puzzle!</Text>
                <Text style={styles.modalText}>Thank you for playing the game!</Text>
                <View style={styles.buttonView}>
                  <Pressable
                    style={[styles.button, styles.buttonAgain]}
                    onPress={() => setEndModalVisible(!endModalVisible)}
                  >
                    <Text style={styles.textStyle}>End the game</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.centeredView}>
          {/* Ending Game Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={endGameModalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setEndGameModalVisible(!endGameModalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Word Puzzle Ended</Text>
                <Text style={styles.modalText}>Current score: {currentScore}</Text>
                <Text style={styles.modalText}>Highscore: {score}</Text>
                <View style={styles.buttonView}>
                  <Pressable
                    style={[styles.button, styles.buttonAgain]}
                    onPress={() => closeEndSummary()}
                  >
                    <Text style={styles.textStyle}>Close</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>

        <View style={styles.centeredView}>
          {/* Start of puzzle Modal */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={startGameModalVisible}
            onRequestClose={() => {
              Alert.alert("Modal has been closed.");
              setStartGameModalVisible(!startGameModalVisible);
            }}
          >
            <View style={styles.centeredView}>
              <View style={styles.modalView}>
                <Text style={styles.modalText}>Press Start to play The Word Puzzle!</Text>
                <View style={styles.buttonView}>
                  <TouchableOpacity style={[styles.leaderBoard, styles.leaderBoard2]} onPress={() => handleLeaderboardStart()}>
                    <Image
                      source = {require('../assets/leadership.png')}
                      style={styles.leaderBoardImage}
                    />
                  </TouchableOpacity>
                  <Pressable
                    style={[styles.button, styles.buttonAgain]}
                    onPress={() => setStartGameModalVisible(!startGameModalVisible)}
                  >
                    <Text style={styles.textStyle}>Start</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </Modal>
        </View>

      </View>
    </SafeAreaView>
  )
}

export default HomeScreen

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'pink',
  },
  button: {
    backgroundColor: '#0782F9',
    width: '60%',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 40,
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },

  input: {
    height: 50,
    width: windowWidth-20,
    marginTop: 10, marginRight: 10, marginLeft:10,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5'
  },

  enter: {
    height: 50,
    width: windowWidth-20,
    marginTop: 5, marginBottom: 10, marginRight: 10, marginLeft:10,
    borderRadius: 10,
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fc6c85'
  },

  puzzlebox: {
    flexDirection:'column',
    backgroundColor: 'pink',
    height: windowHeight,
    marginTop:50,
  },

  centeredView: {
    flex: 1,
    justifyContent: "center",
    marginTop: 22,
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },

  buttonView: {
    flexDirection: 'row',
    margin: 10
  },

  buttonEnd: {
    backgroundColor: "#ff2c2c",
    width: 140,
    marginRight:10,
  },
  buttonAgain: {
    backgroundColor: "#8BC34A",
    width: 140,
    marginLeft:10,
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center",
    fontSize: 30,
    fontWeight: 'bold',
  },

  signOut: {
    alignItems: 'flex-end',
    marginRight: 20,
    marginTop: 5
  },

  leaderBoard: {
    alignItems: 'flex-end',
    marginRight: 20
  },

  leaderBoard2: {
    marginTop: 50
  },

  puzzleBackground: {
    borderRadius: 10,
    justifyContent: 'center',
    margin: 10,
    backgroundColor: 'grey',
    height: 100
  },

  reverseRow: {
    flexDirection: 'row-reverse',
  },

  puzzleText: {
    color: "#F5F5F5",
    fontWeight: "bold",
    fontSize: 30,
    textAlign: 'center'
  },

  signOutImage: {
    width:28,
    height:28,
    resizeMode: "cover"
  },

  leaderBoardImage: {
    width:35,
    height:35,
    resizeMode: "cover"
  },

  marginRight20: {
    marginRight: 20,
  },

  speakerImage: {
    width:30,
    height:30,
    resizeMode: "cover"
  },

  skipImage: {
    width:30,
    height:30,
    resizeMode: "cover"
  },

  enterText: {
    color: "#F5F5F5",
    fontWeight: "bold",
    fontSize: 30,
    textAlign: 'center'
  },

})
