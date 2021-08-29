const Symbols = [
  'https://image.flaticon.com/icons/svg/105/105223.svg', // 黑桃
  'https://image.flaticon.com/icons/svg/105/105220.svg', // 愛心
  'https://image.flaticon.com/icons/svg/105/105212.svg', // 方塊
  'https://image.flaticon.com/icons/svg/105/105219.svg' // 梅花
]

const GAME_STATE = {
  FirstCardAwait: "FirstCardAwaits",
  SecondCardAwait: "SecondCardAwaits",
  CardsMatchFailed: "CardsMatchFailed",
  CardsMatched: "CardsMatched",
  GameFinished: "GameFinished",
}


const utility = {
  getRandomNumberArray(count) {
    const number = [...Array(count).keys()]
    for (let index = number.length - 1; index > 0; index--) {
      let randomIndex = Math.floor(Math.random() * (index - 1));
      [number[index], number[randomIndex]] = [number[randomIndex], number[index]]
    }
    return number
  }
}

const controller = {
  currentState: GAME_STATE.FirstCardAwait,



  generateCards() {
    view.renderCards(utility.getRandomNumberArray(52))
  },
  dispatchCardAction(card) {
    if (!card.classList.contains('back')) {
      return
    }

    switch (this.currentState) {
      case GAME_STATE.FirstCardAwait:
        view.flipCards(card)
        model.revealCards.push(card)
        this.currentState = GAME_STATE.SecondCardAwait
        break
      case GAME_STATE.SecondCardAwait:
        view.renderTriedTimes(++model.triedTimes)
        view.flipCards(card)
        model.revealCards.push(card)


        if (model.isCardMatched()) {
          view.renderScore(model.score += 10)
          this.currentState = GAME_STATE.CardsMatched
          view.isPaird(...model.revealCards)
          model.revealCards = []
          if (model.score === 260) {
            console.log('showGameFinished')
            this.currentState = GAME_STATE.GameFinished
            view.showGameFinished()
            return
          }
          this.currentState = GAME_STATE.FirstCardAwait
        } else {
          this.currentState = GAME_STATE.CardsMatchFailed
          view.appedWrongAnimation(...model.revealCards)
          setTimeout(controller.resetCards, 1000)
        }
        break
    }

    console.log('currentState: ', this.currentState)
    console.log('revealedCards: ', model.revealCards.map(card => card.dataset.index))
  },

  resetCards() {
    view.flipCards(...model.revealCards)
    model.revealCards = []
    controller.currentState = GAME_STATE.FirstCardAwait
  },


}

const model = {
  revealCards: [],

  isCardMatched() {
    return (this.revealCards[0].dataset.index % 13 === this.revealCards[1].dataset.index % 13)
  },

  score: 0,

  triedTimes: 0
}

const view = {
  getCardElement(index) {
    return `<div data-index="${index}" class="card back"></div>`
  },

  getCardContent(index) {
    const number = this.transformNumber((index % 13) + 1)
    const symbol = Symbols[Math.floor(index / 13)]
    return `
      <p>${number}</p>
      <img src=${symbol} />
      <p>${number}</p>
    `
  },

  transformNumber(number) {
    switch (number) {
      case 11:
        return 'J'
      case 12:
        return 'Q'
      case 13:
        return 'K'
      case 1:
        return 'A'
      default:
        return number
    }
  },

  renderCards(indexes) {
    const displayCards = document.querySelector('#cards')
    displayCards.innerHTML = indexes.reduce((acc, index) => {
      acc += this.getCardElement(index)
      return acc
    }, '')
  },

  flipCards(...cards) {
    cards.map(card => {
      const index = Number(card.dataset.index)
      if (card.classList.contains('back')) {
        card.classList.remove('back')
        card.innerHTML = this.getCardContent(index)
        return
      }
      card.classList.add('back')
      card.innerHTML = null
    })

  },

  isPaird(...cards) {
    cards.map(card => {
      card.classList.add('paired')
    })
  },

  renderScore(score) {
    document.querySelector('.score').innerText = `分數: ${score}`
  },

  renderTriedTimes(tried) {
    document.querySelector('.tried').innerText = `你試了: ${tried} 次`
  },

  appedWrongAnimation(...cards) {
    cards.map(card => {
      card.classList.add('wrong')
      card.addEventListener('animation', e => {
        e.target.classList.remove('wrong')
      }, { once: true })
    })
  },

  showGameFinished() {
    const div = document.createElement('div')
    div.classList.add('completed')
    div.innerHTML = `
      <p>完成!</p>
      <p>分數: ${model.score}</p>
      <p>你試了: ${model.triedTimes} 次</p>`
    const header = document.querySelector('#header')
    header.before(div)
  }
}

controller.generateCards()

document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('click', e => {
    controller.dispatchCardAction(card)
  })
})
