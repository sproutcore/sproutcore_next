import { CreditCardValidator } from './credit_card.js';
import { DateValidator } from './date.js';
import { DateTimeValidator } from './date_time.js';
import { EmailOrEmptyValidator, EmailValidator } from './email.js';
import { NotEmptyValidator } from './not_empty.js';
import { NumberValidator } from './number.js';
import { PasswordValidator } from './password.js';
import { PositiveIntegerValidator } from './positive_integer.js';
import {Validator as BaseValidator } from './validator.js';

export const Validator = BaseValidator;

Validator.CreditCard = CreditCardValidator;
Validator.DateTime = DateTimeValidator;
Validator.Date = DateValidator;
Validator.EmailOrEmpty = EmailOrEmptyValidator;
Validator.Email = EmailValidator;
Validator.NotEmpty = NotEmptyValidator;
Validator.Number = NumberValidator;
Validator.Password = PasswordValidator;
Validator.PositiveInteger = PositiveIntegerValidator;