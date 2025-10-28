export const onlyDigits = (value: string) => value.replace(/\D/g, '');

export const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 11)
  ];
  return parts[0]
    + (parts[1] ? `.${parts[1]}` : '')
    + (parts[2] ? `.${parts[2]}` : '')
    + (parts[3] ? `-${parts[3]}` : '');
};

export const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  const ddd = digits.slice(0, 2);
  const first = digits.length > 10 ? digits.slice(2, 7) : digits.slice(2, 6);
  const last = digits.length > 10 ? digits.slice(7, 11) : digits.slice(6, 10);
  const middle = digits.length > 2 ? ` ${first}` : '';
  const tail = last ? `-${last}` : '';
  return ddd ? `(${ddd})${middle}${tail}` : '';
};

export const formatSus = (value: string) => {
  // Formato simples de agrupamento em blocos de 3-4-4-4 (aceita 15 dígitos)
  const digits = onlyDigits(value).slice(0, 15);
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 7),
    digits.slice(7, 11),
    digits.slice(11, 15)
  ];
  return parts
    .filter(Boolean)
    .map((p, i) => (i === 0 ? p : `${p}`))
    .join(' ');
};