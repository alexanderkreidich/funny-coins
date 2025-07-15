# FunnyCoins UI - Web3 Token Airdrop Tool

A modern, user-friendly web application for performing ERC-20 token airdrops on multiple blockchain networks. Built with Next.js, TypeScript, and Web3 technologies.

> **Original TSender**: This is a pet-project copy inspired by [TSender.com](https://www.t-sender.com/) - the original professional token distribution platform.

![TSender Logo](public/tsender-logo.svg)

## 🌟 Features

- **Multi-Chain Support**: Deploy airdrops on Ethereum, Arbitrum, Optimism, Base, zkSync, and more
- **Batch Token Distribution**: Send tokens to multiple recipients in a single transaction
- **Smart Contract Integration**: Utilizes the TSender smart contract for efficient batch transfers
- **Wallet Integration**: Seamless connection with popular Web3 wallets via RainbowKit
- **Real-time Validation**: Input validation for addresses, amounts, and token information
- **Transaction Tracking**: Monitor approval and airdrop transaction progress
- **Error Recovery**: Robust error handling with retry mechanisms
- **Responsive Design**: Mobile-friendly interface with modern UI components
- **Local Storage**: Persist form data across browser sessions
- **Comprehensive Testing**: Full test suite with unit, integration, and E2E tests

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- A Web3 wallet (MetaMask, WalletConnect, etc.)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd ts-tsender-ui-cu
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Configure your environment variables:

   ```env
   WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Architecture

### Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Web3**: Wagmi, Viem, RainbowKit
- **State Management**: Valtio
- **Testing**: Vitest, Playwright, Testing Library
- **Development**: Turbopack, ESLint

### Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── EnhancedAirdropForm.tsx    # Main airdrop form
│   ├── Header.tsx         # Navigation header
│   └── ui/                # Reusable UI components
├── hooks/                 # Custom React hooks
│   ├── useAirdropTransaction.ts   # Transaction logic
│   └── useLocalStorage.ts # Persistence logic
├── utils/                 # Utility functions
│   ├── calculateTotal.ts  # Amount calculations
│   └── errorHandler.ts    # Error management
├── types.ts              # TypeScript definitions
└── constants.ts          # Contract addresses & ABIs
```

## 🔧 Usage

### Basic Airdrop Flow

1. **Connect Wallet**: Click "Connect Wallet" and select your preferred wallet
2. **Enter Token Address**: Input the ERC-20 token contract address
3. **Add Recipients**: Enter recipient addresses (comma or newline separated)
4. **Set Amounts**: Specify amounts for each recipient
5. **Review Transaction**: Check the summary and total amounts
6. **Execute Airdrop**: Approve token spending and execute the batch transfer

### Supported Input Formats

**Recipients** (addresses):

```
0x1234567890123456789012345678901234567890
0xabcdefabcdefabcdefabcdefabcdefabcdefabcd
0x9876543210987654321098765432109876543210
```

**Amounts** (token quantities):

```
100
50.5
25.25
```

### Supported Networks

| Network    | Chain ID | TSender Contract                             |
| ---------- | -------- | -------------------------------------------- |
| Ethereum   | 1        | `0x3aD9F29AB266E4828450B33df7a9B9D7355Cd821` |
| Arbitrum   | 42161    | `0xA2b5aEDF7EEF6469AB9cBD99DE24a6881702Eb19` |
| Optimism   | 10       | `0xAaf523DF9455cC7B6ca5637D01624BC00a5e9fAa` |
| Base       | 8453     | `0x31801c3e09708549c1b2c9E1CFbF001399a1B9fa` |
| zkSync Era | 324      | `0x7e645Ea4386deb2E9e510D805461aA12db83fb5E` |
| Sepolia    | 11155111 | `0xa27c5C77DA713f410F9b15d4B0c52CAe597a973a` |
| Local      | 31337    | `0x5FbDB2315678afecb367f032d93F642f64180aa3` |

## 🧪 Testing

The project includes a comprehensive testing suite with multiple testing strategies:

### Running Tests

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui

# Run E2E tests
npm run test:e2e

# Run specific environment tests
npm run test:node      # Node.js environment
npm run test:jsdom     # Browser environment (JSDOM)
npm run test:happy-dom # Browser environment (Happy DOM)
```

### Test Categories

- **Unit Tests**: Individual function and component testing
- **Integration Tests**: Component interaction testing
- **E2E Tests**: Full user workflow testing with Playwright
- **Performance Tests**: Render and operation performance validation

### Coverage Targets

- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Testing
npm run test         # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:coverage # Run tests with coverage
npm run test:e2e     # Run E2E tests

# Blockchain
npm run anvil        # Start local Anvil node with deployed contracts
```

### Local Blockchain Development

For local development with a blockchain:

1. **Start Anvil with deployed contracts**:

   ```bash
   npm run anvil
   ```

2. **Configure your wallet**:

   - Add local network (Chain ID: 31337)
   - Import test accounts from Anvil output

3. **Deploy test tokens** (if needed):
   The `tsender-deployed.json` file contains pre-deployed contract state

### Environment Configuration

Create a `.env` file with:

```env
# Required
WALLETCONNECT_PROJECT_ID=your_project_id_here

# Optional
NEXT_PUBLIC_ENABLE_TESTNETS=true
```

## 🔒 Security Considerations

- **Smart Contract Audits**: TSender contracts should be audited before mainnet use
- **Input Validation**: All user inputs are validated client-side and on-chain
- **Approval Management**: Users approve exact amounts needed for transactions
- **Error Handling**: Comprehensive error catching and user feedback
- **Rate Limiting**: Consider implementing rate limiting for production use

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Ensure all tests pass before submitting
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [TSender Protocol](https://github.com/tsender) - Original smart contract implementation
- [RainbowKit](https://rainbowkit.com/) - Wallet connection infrastructure
- [Wagmi](https://wagmi.sh/) - React hooks for Ethereum
- [Viem](https://viem.sh/) - TypeScript interface for Ethereum

## 📞 Support

For questions, issues, or contributions:

- Open an issue on GitHub
- Check existing documentation
- Review the test suite for usage examples

---

**⚠️ Disclaimer**: This is a pet project for educational and development purposes. Always test thoroughly on testnets before using with real tokens on mainnet. Use at your own risk.
