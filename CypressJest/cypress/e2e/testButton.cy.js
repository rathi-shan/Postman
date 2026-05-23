import Button from './Button'

describe('Button Component', () => {
  it('renders with the correct label and triggers an action', () => {
    const handleClick = cy.stub().as('clickHandler')
    cy.mount(<Button label="Submit" onClick={handleClick} />)
    
    cy.get('button').should('contain', 'Submit')
    cy.get('button').click()
    
    cy.get('@clickHandler').should('have.been.called')
  })
})