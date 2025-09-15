import "./styles/index.scss";

import belliboltImage from "./assets/bellibolt.png";
import dittoImage from "./assets/ditto.png";
import wooperImage from "./assets/wooper.png";
import pokemonCardBackImage from "./assets/pokemonCardBack.png";
import pokemonHeaderImage from "./assets/pokemonHeader.jpg";

interface GameCardData {
	name: string;
	imageUrl: string;
}

interface Card {
	element: HTMLDivElement;
	cardData: GameCardData;
	isFlipped: boolean;
	isMatched: boolean;
	index: number;
}

// Local Pokemon card data
const LOCAL_CARDS: GameCardData[] = [
	{
		name: "Bellibolt",
		imageUrl: belliboltImage,
	},
	{ name: "Ditto", imageUrl: dittoImage },
	{ name: "Wooper", imageUrl: wooperImage },
];

// Encapsulates the Card Match game logic and UI interactions
class CardMatchGame {
	private attempts: number = 3;
	private cards: Card[] = [];
	private flippedCards: Card[] = [];
	private matchedPairs: number = 0;
	private gameEnded: boolean = false;
	private gameCards: GameCardData[] = []; // Store the Pokemon card data
	private isLoading: boolean = false; // Track loading state

	private attemptsElement: HTMLElement | null;
	private cardsGrid: HTMLElement | null;
	private gameMessage: HTMLElement | null;
	private startOverBtn: HTMLElement | null;

	constructor() {
		this.attemptsElement = document.getElementById("attemptsCount");
		this.cardsGrid = document.getElementById("cardsGrid");
		this.gameMessage = document.getElementById("gameMessage");
		this.startOverBtn = document.getElementById("startOverBtn");

		this.startOverBtn?.addEventListener("click", () => this.startNewGame());
		this.addHeroImage();
		this.initializeGame();
	}

	// Add hero background image above the content
	private addHeroImage(): void {
		const gameContainer = document.querySelector(".game-container");
		if (gameContainer) {
			// Create hero image at the top
			const heroImage = document.createElement("div");
			heroImage.className = "hero-image";
			heroImage.innerHTML = `<img src="${pokemonHeaderImage}" alt="Pokemon Background" class="hero-bg" />`;

			// Create content wrapper
			const gameContent = document.createElement("div");
			gameContent.className = "game-content";

			// Create left panel wrapper
			const leftPanel = document.createElement("div");
			leftPanel.className = "game-left-panel";

			// Move existing content to left panel
			const gameHeader = gameContainer.querySelector(".game-header");
			const gameMessage = gameContainer.querySelector(".game-message");
			const startOverBtn = gameContainer.querySelector(".start-over-btn");

			// Add elements to left panel
			if (gameHeader) leftPanel.appendChild(gameHeader);
			if (gameMessage) leftPanel.appendChild(gameMessage);
			if (startOverBtn) leftPanel.appendChild(startOverBtn);

			// Add left panel to content wrapper
			gameContent.appendChild(leftPanel);

			// Move cards grid to content wrapper
			const cardsGrid = gameContainer.querySelector(".cards-grid");
			if (cardsGrid) {
				gameContent.appendChild(cardsGrid);
			}

			// Insert hero image at the top
			gameContainer.insertBefore(heroImage, gameContainer.firstChild);

			// Insert content wrapper after hero image
			gameContainer.insertBefore(gameContent, gameContainer.lastChild);
		}
	}

	// Initialize the game with local Pokemon cards
	private initializeGame(): void {
		this.gameCards = [...LOCAL_CARDS, ...LOCAL_CARDS]; // Create pairs for matching
		this.startNewGame();
	}

	// Fisher–Yates shuffle to randomize card order
	private shuffleArray<T>(array: T[]): T[] {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	// Reset all state and (re)deal the cards
	private startNewGame(): void {
		if (this.isLoading) return; // Don't start if still loading

		this.attempts = 3;
		this.flippedCards = [];
		this.matchedPairs = 0;
		this.gameEnded = false;

		const shuffledCards = this.shuffleArray(this.gameCards);

		this.updateAttemptsDisplay();
		this.hideGameMessage();
		this.createCards(shuffledCards);
	}

	// Build the card elements and render them to the grid
	private createCards(cardData: GameCardData[]): void {
		if (!this.cardsGrid) return;

		this.cardsGrid.innerHTML = "";
		this.cards = [];

		cardData.forEach((data, index) => {
			const cardElement = document.createElement("div");
			cardElement.className = "card";

			cardElement.innerHTML = `
				<div class="card-face card-front">
					<img src="${data.imageUrl}" alt="${data.name}" class="pokemon-card-image" />
					<div class="pokemon-name">${data.name}</div>
				</div>
				<div class="card-face card-back">
					<img src="${pokemonCardBackImage}" alt="Pokemon Card Back" class="pokemon-card-back" />
				</div>
			`;

			const card: Card = {
				element: cardElement,
				cardData: data,
				isFlipped: false,
				isMatched: false,
				index,
			};

			cardElement.addEventListener("click", () =>
				this.handleCardClick(card)
			);
			this.cardsGrid?.appendChild(cardElement);
			this.cards.push(card);
		});
	}

	// Handle user clicking a card with guards for game state
	private handleCardClick(card: Card): void {
		if (
			this.gameEnded ||
			card.isFlipped ||
			card.isMatched ||
			this.flippedCards.length >= 2
		) {
			return;
		}

		this.flipCard(card);
		this.flippedCards.push(card);

		if (this.flippedCards.length === 2) {
			setTimeout(() => this.checkMatch(), 800);
		}
	}

	// Visually and logically flip a card face-up
	private flipCard(card: Card): void {
		card.isFlipped = true;
		card.element.classList.add("flipped");
	}

	// Revert a card to face-down state
	private unflipCard(card: Card): void {
		card.isFlipped = false;
		card.element.classList.remove("flipped");
	}

	// Compare two revealed cards, update matches/attempts, and progress state
	private checkMatch(): void {
		const [card1, card2] = this.flippedCards;

		// Compare Pokemon names to determine if cards match
		if (card1.cardData.name === card2.cardData.name) {
			card1.isMatched = true;
			card2.isMatched = true;
			card1.element.classList.add("matched");
			card2.element.classList.add("matched");
			this.matchedPairs++;

			if (this.matchedPairs === 3) {
				this.endGame(true);
			}
		} else {
			this.unflipCard(card1);
			this.unflipCard(card2);
			this.attempts--;
			this.updateAttemptsDisplay();

			if (this.attempts === 0) {
				this.endGame(false);
			}
		}

		this.flippedCards = [];
	}

	// Keep the attempts counter in sync with the UI
	private updateAttemptsDisplay(): void {
		if (this.attemptsElement) {
			this.attemptsElement.textContent = String(this.attempts);
		}
	}

	// Finalize the game and reveal a win/lose message
	private endGame(won: boolean): void {
		this.gameEnded = true;

		if (won) {
			this.showGameMessage("You Won!", "win");
		} else {
			this.showGameMessage("Game Over!", "lose");
			this.cards.forEach((card) => {
				if (!card.isMatched) {
					this.flipCard(card);
				}
			});
		}
	}

	// Show a banner with game outcome
	private showGameMessage(message: string, type: string): void {
		if (this.gameMessage) {
			this.gameMessage.textContent = message;
			this.gameMessage.className = `game-message show ${type}`;
		}
	}

	// Hide the banner and reset its classes
	private hideGameMessage(): void {
		if (this.gameMessage) {
			this.gameMessage.className = "game-message";
		}
	}
}

// Bootstrap the game once the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
	new CardMatchGame();
});
