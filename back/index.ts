import { prisma } from "./src/infrastructure/db/prisma.client";

async function main() {
	// ... you will write your Prisma ORM queries here
}

main()
	.then(async () => {
		await prisma.$disconnect();
	})
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
		process.exit(1);
	});
