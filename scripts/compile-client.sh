npx oazapfts ./api/swagger/swagger.yaml ./src/api.ts
echo "/* eslint-disable valid-jsdoc, @typescript-eslint/no-unused-vars */
$(cat ./src/api.ts)" > ./src/api.ts
npx prettier --write src/api.ts
