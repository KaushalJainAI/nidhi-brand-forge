interface PriceProps {
  amount: number;
  currency?: string;
  className?: string;
}

const Price = ({ amount, currency = '₹', className }: PriceProps) => (
  <span className={className}>
    <span aria-hidden="true">{currency}</span>
    <span>{amount.toLocaleString('en-IN')}</span>
  </span>
);

export default Price;
