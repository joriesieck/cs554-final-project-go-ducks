import { Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function NavBar() {
	const [value, setValue] = useState(window.location.href.match(/\/[a-zA-Z]+\/?$/)[0].substr(1).toLowerCase());

	return (
		<Tabs
			value={value}
			onChange={(e) => { setValue(e.target.innerText.toLowerCase()) }}
		>
			<Tab
				value='home'
				label='Home'
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