import createHttpError, { type HttpError } from 'http-errors';
import express, {type Request, type Response} from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';

import apiV1Router from '@/routes/apiV1';

export const app = express();

// view engine setup
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1', apiV1Router);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createHttpError(404, "endpoint could not be found."));
});

// error handler
app.use(function (err: HttpError, req: Request, res: Response) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(3000, () => {
  console.log("App listening on http://localhost:3000.");
})