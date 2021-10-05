const port = 4000;
const maxFileSize = 20000000;
const maxFiles = 1;
const isProduction = process.env.NODE_ENV === 'production';
const entities = [`./src/models/*.${isProduction ? 'js' : 'ts'}`];

export {
  port,
  maxFileSize,
  maxFiles,
  isProduction,
  entities,
}
