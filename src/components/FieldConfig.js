import React from 'react';
import PropTypes from 'prop-types';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';

const options = [
	{ value: 'allSearches', label: 'Found in all searches', },
	{ value: 'admissionSearches', label: 'Found in admission searches', },
	{ value: 'twinSearches', label: 'Found in twin searches', },
];

export function FieldConfig({ value, onChange }) {
	return (
		<div>
			<Typography variant="subtitle2">Pre-Populate field when:</Typography>
			{options.map(o => (
				<div key={o.value}>
					<FormControlLabel
						value={o.value}
						control={<Checkbox />}
						label={o.label}
						checked={value.includes(o.value)}
						onChange={() => {
							let _val = [];
							const all = options.filter((_, i) => i !== 0);
							if (value.includes(o.value)) {
								_val = value.filter(v => v !== o.value);
								if (o.value === options[0].value) {
									_val = [];
								} else {
									_val = _val.filter(v => v !== options[0].value);
								}
							} else {
								_val = [...value, o.value];
								if (o.value === options[0].value) _val = options.map(o => o.value);
								if (_val.length >= all.length) _val = options.map(o => o.value);
							}
							onChange(_val);
						}}
					/>
				</div>
			))}
		</div>
	);
}

FieldConfig.propTypes = {
	value: PropTypes.arrayOf(PropTypes.string),
	onChange: PropTypes.func,
};
