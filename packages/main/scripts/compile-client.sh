npx oazapfts ./api/swagger/swagger.yaml ./src/api.ts
echo "/* eslint-disable valid-jsdoc, @typescript-eslint/no-unused-vars */\n$(cat ./src/api.ts)" > ./src/api.ts
sed -i '' 's/v1\${/v1`/' ./src/api.ts
npx prettier --write src/api.ts