## Use this to hit the API deployed on render.com
## WARNING: The server might be down
curl --location 'https://identity-reconciliation-8m8i.onrender.com/identify' \
--header 'Content-Type: application/json' \
--data-raw '{
    "email": "iceage@abc.com",
    "phoneNumber": "22451234"
}'

## Clone and run locally
npm run dev
