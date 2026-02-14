// Custom error classes for better error management
export class ValidationError extends Error {
	constructor(message: string, public details?: any) {
		super(message);
		this.name = "ValidationError";
	}
}

export class NotFoundError extends Error {
	constructor(resource: string) {
		super(`${resource} not found`);
		this.name = "NotFoundError";
	}
}

export class ForbiddenError extends Error {
	constructor(message: string = "Forbidden") {
		super(message);
		this.name = "ForbiddenError";
	}
}

export class BadRequestError extends Error {
	constructor(message: string = "Bad Request") {
		super(message);
		this.name = "BadRequestError";
	}
}

export class UnauthorizedError extends Error {
	constructor(message: string = "Unauthorized") {
		super(message);
		this.name = "UnauthorizedError";
	}
}

// Error response helper
export const createErrorResponse = (error: any, statusCode: number = 500) => {
	if (error instanceof ValidationError) {
		return { success: false, error: error.message, details: error.details };
	}
	if (error instanceof NotFoundError) {
		return { success: false, error: error.message };
	}
	if (error instanceof ForbiddenError) {
		return { success: false, error: error.message };
	}
	if (error instanceof UnauthorizedError) {
		return { success: false, error: error.message };
	}
	if (error instanceof BadRequestError) {
		return { success: false, error: error.message };
	}

	console.error("Unexpected error:", error);
	return { success: false, error: "Internal server error" };
};
