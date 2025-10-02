export const validatePromotionCode = (code: string) => {
  const errors: string[] = [];

  if (!code) {
    errors.push("Promotion code is required");
  } else if (code.trim().length < 3) {
    errors.push("Promotion code must be at least 3 characters");
  } else if (!/^[A-Z0-9]+$/.test(code.toUpperCase())) {
    errors.push("Promotion code can only contain letters and numbers");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
