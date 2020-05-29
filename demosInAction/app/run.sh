docker build -t app .
docker run -v `pwd`:/src -p 3000:3000 app  