import { Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function NavBar () {
	const [value, setValue] = useState('landing');

	return (
		<Tabs
			value={value}
			onChange={(e) => {setValue(e.target.innerText.toLowerCase())}}
		>
			<Tab
				value='landing'
				label='Landing'
				component={Link}
				to='/home'
			/>
			<Tab
				value='profile'
				label='Profile'
				component={Link}
				to='/profile'
			/>
		</Tabs>
	)
}