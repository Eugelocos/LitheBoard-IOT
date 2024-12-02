# Style Guidelines

This document outlines the style guidelines to ensure code consistency and maintainability across the project.

---

## Naming Conventions

- **Variables**:  
  Use **lowercase letters** with words separated by underscores (`_`).  
  Examples:  
  ```javascript
  let user_name = "John Doe";
  let max_value = 100;```
- **Functions**:
  Use CamelCase, capitalizing the first letter of each word (except the first word).
  Examples:
  ```javascript

  function calculateSum(a, b) {
      return a + b;
  }
  
  function fetchUserData(user_id) {
      // Function logic
  }
  ```
## Formatting
- **Indentation**: Use 2 spaces for indentation.
- **Line Length**: Limit lines to a maximum of 80 characters for readability.
- **Spacing**:
  Add a space after commas, between operators, and before braces:
  ```javascript
  let total = a + b;
  if (value > 0) {
      console.log("Positive value");
  }
  ```
Try to avoid extra spaces inside parentheses or brackets.
## Comments
- **Purpose**: Write comments to explain why the code exists rather than what it does.
- **Style**: Use single-line comments (//) for short explanations and block comments (/* */) for longer descriptions.
- **Examples**:
  ```javascript
  // Validate if the user is logged in before accessing the dashboard
  if (user_is_logged_in) {
      loadDashboard();
  }

  /* Perform the following steps:
   * 1. Fetch data from the server
   * 2. Process and format the data
   * 3. Render the output to the UI
   */
  ```
## File and Folder Structure
- **File Names**: Use lowercase letters with words separated by underscores (_).
- **Examples**:
  user_profile.js
  main_dashboard.css

- **Folder Organization**:
  Group files by feature or module:

  ```css
  src/
    components/
      navbar/
        navbar.jsx
      footer/
        footer.jsx
    utils/
      api_client.js
  ```
## Testing
- Write unit tests for all new functionality.
- Use descriptive names for test cases.
- **Example**:
  ```javascript
  it("should return the correct sum for positive numbers", () => {
    expect(calculateSum(2, 3)).toBe(5);
  });```
## Tools and Linters
- Use a linter (e.g., ESLint) to enforce these guidelines.
- Recommended ESLint rules for naming conventions:
  ```json
  "rules": {
      "camelcase": ["error", { "properties": "never" }],
      "id-match": [
          "error",
          "^[a-z_]+$|^[a-z][a-zA-Z]*$",
          {
              "properties": true
          }
      ]
  }
  ```

Adhering to these guidelines ensures that the codebase remains consistent, readable, and maintainable for all contributors.

Thanks for being a contributor. 🙂
