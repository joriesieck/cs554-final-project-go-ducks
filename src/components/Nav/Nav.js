import { Tabs, Tab } from '@mui/material';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function NavBar(props) {
	const [value, setValue] = useState('landing');

	useEffect(() => {
		const newUrl = window.location.href.match(/\/[a-zA-Z]+\/?$/)[0];
		setValue(newUrl.substr(1));
	}, [window.location.href])

	return (
		<Tabs
			value={value}
			onChange={(e) => { setValue(e.target.innerText.toLowerCase()) }}
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