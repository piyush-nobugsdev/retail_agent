export const productSearchTool = {
  type: "function",
  function: {
    name: "search_products",
    description:
      "Search beauty and skincare products based on category, skin type, skin concern, or budget",
    parameters: {
      type: "object",
      properties: {
        category: {
          type: "string",
          description: "Product category like beauty or skincare"
        },
        skinType: {
          type: "string",
          description: "Skin type like oily, dry, combination"
        },
        skinConcern: {
          type: "string",
          description: "Concern like acne, dark spots, dullness"
        },
        maxPrice: {
          type: "number",
          description: "Maximum price in INR"
        }
      }
    }
  }
};
