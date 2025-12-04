import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FAQ } from './FAQ'
import { FAQ_ITEMS } from '@constants/faq'

describe('FAQ', () => {
  describe('Rendering', () => {
    it('should render the FAQ section', () => {
      render(<FAQ />)

      expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument()
    })

    it('should render all FAQ items from constants', () => {
      render(<FAQ />)

      FAQ_ITEMS.forEach((item) => {
        expect(screen.getByText(item.question)).toBeInTheDocument()
      })
    })

    it('should render section with correct id', () => {
      const { container } = render(<FAQ />)

      const section = container.querySelector('#faq')
      expect(section).toBeInTheDocument()
    })

    it('should render subtitle with contact link', () => {
      render(<FAQ />)

      expect(screen.getByText(/Everything you need to know about Paperlyte/i)).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /contact our support team/i })).toBeInTheDocument()
    })

    it('should render footer with help links', () => {
      render(<FAQ />)

      expect(screen.getByRole('link', { name: /help center/i })).toBeInTheDocument()
      expect(screen.getByRole('link', { name: /community forum/i })).toBeInTheDocument()
    })
  })

  describe('Accordion Functionality', () => {
    it('should render all items collapsed by default', () => {
      render(<FAQ />)

      FAQ_ITEMS.forEach((item) => {
        const questionButton = screen.getByRole('button', { name: new RegExp(item.question, 'i') })
        expect(questionButton).toHaveAttribute('aria-expanded', 'false')
      })
    })

    it('should expand item when clicked', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const firstQuestion = FAQ_ITEMS[0].question
      const firstAnswer = FAQ_ITEMS[0].answer

      const questionButton = screen.getByRole('button', { name: new RegExp(firstQuestion, 'i') })

      await user.click(questionButton)

      expect(questionButton).toHaveAttribute('aria-expanded', 'true')
      expect(screen.getByText(firstAnswer)).toBeInTheDocument()
    })

    it('should collapse item when clicked again', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const firstQuestion = FAQ_ITEMS[0].question
      const questionButton = screen.getByRole('button', { name: new RegExp(firstQuestion, 'i') })

      // Open
      await user.click(questionButton)
      expect(questionButton).toHaveAttribute('aria-expanded', 'true')

      // Close
      await user.click(questionButton)
      expect(questionButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should allow multiple items to be open simultaneously', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const firstQuestion = FAQ_ITEMS[0].question
      const secondQuestion = FAQ_ITEMS[1].question

      const firstButton = screen.getByRole('button', { name: new RegExp(firstQuestion, 'i') })
      const secondButton = screen.getByRole('button', { name: new RegExp(secondQuestion, 'i') })

      await user.click(firstButton)
      await user.click(secondButton)

      expect(firstButton).toHaveAttribute('aria-expanded', 'true')
      expect(secondButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should display answer content when expanded', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const item = FAQ_ITEMS[0]
      const questionButton = screen.getByRole('button', { name: new RegExp(item.question, 'i') })

      await user.click(questionButton)

      expect(screen.getByText(item.answer)).toBeVisible()
    })

    it('should handle all FAQ items correctly', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      for (const item of FAQ_ITEMS) {
        const questionButton = screen.getByRole('button', { name: new RegExp(item.question, 'i') })

        await user.click(questionButton)
        expect(questionButton).toHaveAttribute('aria-expanded', 'true')
        expect(screen.getByText(item.answer)).toBeInTheDocument()

        await user.click(questionButton)
        expect(questionButton).toHaveAttribute('aria-expanded', 'false')
      }
    })
  })

  describe('Accessibility', () => {
    it('should have correct aria-expanded attributes', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const questionButton = screen.getByRole('button', {
        name: new RegExp(FAQ_ITEMS[0].question, 'i'),
      })

      expect(questionButton).toHaveAttribute('aria-expanded', 'false')

      await user.click(questionButton)

      expect(questionButton).toHaveAttribute('aria-expanded', 'true')
    })

    it('should have aria-controls pointing to answer', () => {
      render(<FAQ />)

      const item = FAQ_ITEMS[0]
      const questionButton = screen.getByRole('button', { name: new RegExp(item.question, 'i') })

      const ariaControls = questionButton.getAttribute('aria-controls')
      expect(ariaControls).toBeTruthy()

      const answerElement = document.getElementById(ariaControls!)
      expect(answerElement).toBeInTheDocument()
    })

    it('should have aria-hidden on collapsed answers', () => {
      render(<FAQ />)

      const item = FAQ_ITEMS[0]
      const questionButton = screen.getByRole('button', { name: new RegExp(item.question, 'i') })
      const ariaControls = questionButton.getAttribute('aria-controls')
      expect(ariaControls).toBeTruthy()
      const answerElement = document.getElementById(ariaControls!)

      expect(answerElement).toHaveAttribute('aria-hidden', 'true')
    })

    it('should remove aria-hidden when answer is expanded', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const item = FAQ_ITEMS[0]
      const questionButton = screen.getByRole('button', { name: new RegExp(item.question, 'i') })

      await user.click(questionButton)

      const ariaControls = questionButton.getAttribute('aria-controls')
      expect(ariaControls).toBeTruthy()
      const answerElement = document.getElementById(ariaControls!)

      expect(answerElement).toHaveAttribute('aria-hidden', 'false')
    })

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const questionButton = screen.getByRole('button', {
        name: new RegExp(FAQ_ITEMS[0].question, 'i'),
      })

      questionButton.focus()
      expect(questionButton).toHaveFocus()

      // Press Enter to expand
      await user.keyboard('{Enter}')
      expect(questionButton).toHaveAttribute('aria-expanded', 'true')

      // Press Enter to collapse
      await user.keyboard('{Enter}')
      expect(questionButton).toHaveAttribute('aria-expanded', 'false')
    })

    it('should navigate between questions with Tab', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const firstButton = screen.getByRole('button', {
        name: new RegExp(FAQ_ITEMS[0].question, 'i'),
      })

      firstButton.focus()

      await user.keyboard('{Tab}')

      // Focus should have moved to another element
      expect(document.activeElement).not.toBe(firstButton)
    })
  })

  describe('Icon Display', () => {
    it('should have accessible icon labels', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const questionButton = screen.getByRole('button', {
        name: new RegExp(FAQ_ITEMS[0].question, 'i'),
      })

      // When collapsed, should show "Expand answer"
      let icon = questionButton.querySelector('i')
      expect(icon).toHaveAttribute('aria-label', 'Expand answer')

      await user.click(questionButton)

      // When expanded, should show "Collapse answer"
      icon = questionButton.querySelector('i')
      expect(icon).toHaveAttribute('aria-label', 'Collapse answer')
    })
  })

  describe('Answer Content', () => {
    it('should use article element for semantic HTML', () => {
      const { container } = render(<FAQ />)

      const articles = container.querySelectorAll('article')
      expect(articles.length).toBe(FAQ_ITEMS.length)
    })
  })

  describe('State Management', () => {
    it('should maintain independent state for each item', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const [item1, item2, item3] = FAQ_ITEMS

      const button1 = screen.getByRole('button', { name: new RegExp(item1.question, 'i') })
      const button2 = screen.getByRole('button', { name: new RegExp(item2.question, 'i') })
      const button3 = screen.getByRole('button', { name: new RegExp(item3.question, 'i') })

      // Open first and third
      await user.click(button1)
      await user.click(button3)

      expect(button1).toHaveAttribute('aria-expanded', 'true')
      expect(button2).toHaveAttribute('aria-expanded', 'false')
      expect(button3).toHaveAttribute('aria-expanded', 'true')

      // Close first
      await user.click(button1)

      expect(button1).toHaveAttribute('aria-expanded', 'false')
      expect(button2).toHaveAttribute('aria-expanded', 'false')
      expect(button3).toHaveAttribute('aria-expanded', 'true')
    })

    it('should handle rapid toggling', async () => {
      const user = userEvent.setup()
      render(<FAQ />)

      const questionButton = screen.getByRole('button', {
        name: new RegExp(FAQ_ITEMS[0].question, 'i'),
      })

      await user.click(questionButton)
      await user.click(questionButton)
      await user.click(questionButton)
      await user.click(questionButton)

      expect(questionButton).toHaveAttribute('aria-expanded', 'false')
    })
  })

  describe('Links', () => {
    it('should render contact support link with correct href', () => {
      render(<FAQ />)

      const contactLink = screen.getByRole('link', { name: /contact our support team/i })
      expect(contactLink).toHaveAttribute('href', '#contact')
    })

    it('should render help center link with correct href', () => {
      render(<FAQ />)

      const helpLink = screen.getByRole('link', { name: /help center/i })
      expect(helpLink).toHaveAttribute('href', '#help')
    })

    it('should render community forum link with correct href', () => {
      render(<FAQ />)

      const forumLink = screen.getByRole('link', { name: /community forum/i })
      expect(forumLink).toHaveAttribute('href', '#community')
    })
  })
})
