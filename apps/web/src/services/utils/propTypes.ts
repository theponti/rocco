import PropTypes from "prop-types";

export type User = {
  id: string;
  email: string;
  name: string;
  isAdmin: string;
  createdAt: string;
  updatedAt: string;
};

export const userPropType = PropTypes.shape({
  id: PropTypes.string.isRequired,
  avatar: PropTypes.string,
  email: PropTypes.string.isRequired,
  name: PropTypes.string,
});

export const transactionPropType = PropTypes.shape({
  _id: PropTypes.string,
  payee: PropTypes.string,
  amount: PropTypes.number,
});
