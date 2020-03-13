const voices = speechSynthesis.getVoices()
console.log(voices)
const speak = (text) => {
  const speech = new SpeechSynthesisUtterance()
  // 配置
  speech.lang = 'zh-cn'
  speech.rate = 0.5
  speech.text = text
  speech.voice = voices[2]
  speechSynthesis.speak(speech)
}
// speak('hahahs')
export default {
  speak
}
