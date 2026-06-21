import styles from './ProductOptions.module.css';

function findMatchingVariant(variants, selected, optionNames) {
  if (optionNames.some((name) => !selected[name])) return null;
  return variants.find((variant) =>
    optionNames.every((name) => variant.optionValues?.[name] === selected[name])
  );
}

export default function ProductOptions({ options, variants, selected, onChange }) {
  if (!options?.length) return null;

  const optionNames = options.map((option) => option.name);

  const handleSelect = (name, value) => {
    const nextSelected = { ...selected, [name]: value };
    onChange(nextSelected, findMatchingVariant(variants, nextSelected, optionNames));
  };

  return (
    <div className={styles.options}>
      {options.map((option) => (
        <div key={option.name} className={styles.group}>
          <span className={styles.label}>{option.name}</span>
          <div className={styles.values}>
            {option.values.map((value) => (
              <button
                key={value}
                type="button"
                className={selected[option.name] === value ? styles.active : styles.value}
                onClick={() => handleSelect(option.name, value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
