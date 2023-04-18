import React, { ButtonHTMLAttributes, HTMLAttributes, PropsWithChildren, useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
const queryClient = new QueryClient()

type TimelineProps = {
	city: string
} & HTMLAttributes<HTMLDivElement>

const sunColorMap = new Map([
	[0, { bg: 'bg-gray-800', text: 'text-white' }],
	[1, { bg: 'bg-gray-800', text: 'text-white' }],
	[2, { bg: 'bg-gray-800', text: 'text-white' }],
	[3, { bg: 'bg-gray-800', text: 'text-white' }],
	[4, { bg: 'bg-gray-700', text: 'text-white' }],
	[5, { bg: 'bg-yellow-800', text: 'text-white' }],
	[6, { bg: 'bg-yellow-700', text: 'text-white' }],
	[7, { bg: 'bg-yellow-500', text: 'text-white' }],
	[8, { bg: 'bg-yellow-500', text: 'text-white' }],
	[9, { bg: 'bg-yellow-200', text: 'text-black' }],
	[10, { bg: 'bg-yellow-200', text: 'text-black' }],
	[11, { bg: 'bg-yellow-200', text: 'text-black' }],
	[12, { bg: 'bg-yellow-200', text: 'text-black' }],
	[13, { bg: 'bg-yellow-200', text: 'text-black' }],
	[14, { bg: 'bg-yellow-200', text: 'text-black' }],
	[15, { bg: 'bg-yellow-200', text: 'text-black' }],
	[16, { bg: 'bg-yellow-200', text: 'text-black' }],
	[17, { bg: 'bg-yellow-200', text: 'text-black' }],
	[18, { bg: 'bg-yellow-500', text: 'text-white' }],
	[19, { bg: 'bg-yellow-700', text: 'text-white' }],
	[20, { bg: 'bg-yellow-800', text: 'text-white' }],
	[21, { bg: 'bg-gray-800', text: 'text-white' }],
	[22, { bg: 'bg-gray-800', text: 'text-white' }],
	[23, { bg: 'bg-gray-800', text: 'text-white' }],
])

type SunsetSunriseResult = {
	results: {
		sunrise: string
		sunset: string
		solar_noon: string
		day_length: string
		civil_twilight_begin: string
		civil_twilight_end: string
		nautical_twilight_begin: string
		nautical_twilight_end: string
		astronomical_twilight_begin: string
		astronomical_twilight_end: string
	}
}

type LatLngFromCityResult = {
	country: string
	lat: number
	lon: number
	name: string
	state: string
}

type GeonamesTimezoneResult = {
	time: string
	sunrise: string
	sunset: string
	countryName: string
	lng: number
	lat: number
	countryCode: string
	timezoneId: string
	gmtOffset: number
	rawOffset: number
	dstOffset: number
}

const openweatherApikey = 'fb9d1af72a8b4f4709c9132e6f3755c1'
const geonamesApikey = 'martinhappycss'
const getLatLngFromCity = (city: string): Promise<LatLngFromCityResult[]> => fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${openweatherApikey}`).then(r => r.json())
const getSunriseSunset = (lat: number, lng: number): Promise<SunsetSunriseResult> => fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`).then(r => r.json())
const getTimezone = (lat: number, lng: number): Promise<GeonamesTimezoneResult> => fetch(`https://api.geonames.org/timezoneJSON?lat=${lat}&lng=${lng}&username=${geonamesApikey}`).then(r => r.json())

const getSunColor = (sunrise: number, sunset: number, current: number) => {
	if (current == sunrise) return 'bg-yellow-600 text-black'
	if (current == sunrise + 1) return 'bg-yellow-500 text-black'
	if (current == sunset) return 'bg-yellow-600 text-black'
	if (current == sunset - 1) return 'bg-yellow-500 text-black'
	if (current < sunrise || current > sunset) return 'bg-gray-800 text-white'
	if (current > sunrise || current < sunset) return 'bg-yellow-300 text-black'
	return ''
}

const Timeline: React.FC<PropsWithChildren<TimelineProps>> = (props) => {
	const hours = 24
	const maxHours = 24
	const { data: cityCoordinates } = useQuery(
		['city', props.city],
		() => getLatLngFromCity(props.city)
	)
	const { data: timezone } = useQuery(
		['timezone', cityCoordinates?.[0].lat, cityCoordinates?.[0].lon],
		() => getTimezone(cityCoordinates?.[0].lat || 0, cityCoordinates?.[0].lon || 0),
		{
			enabled: !!cityCoordinates
		}
	)
	if (!timezone) return <>no data available :(</>
	const sunrise = new Date(timezone.sunrise).getUTCHours() + 2
	const sunset = new Date(timezone.sunset).getUTCHours() + 2
	const current = new Date(timezone.time).getUTCHours() + 2
	return <div>
		{[...Array(hours)].map((_, i) => {
			const hour = ((i * maxHours / hours) + timezone.dstOffset) % 24
			return <div key={i} className={`px-4 py-1 ${current == hour ? 'bg-green-600 text-black' : getSunColor(sunrise, sunset, hour)}`}>
				{String(hour).padStart(2, '0')}:{String(new Date(timezone.time).getMinutes()).padStart(2, '0')}
			</div>
		})}

	</div>
}

function App() {

	return (
		<div className="App">
			<QueryClientProvider client={queryClient}>
				<div className="flex">
					<div>
						<div className="flex items-center m-4">
							<img className="rounded-full mr-4 border-4 border-yellow-400 w-32" src="https://i.imgur.com/mWiIO6f.jpg" alt="" />
							<div>
								<h2 className="text-3xl">Misan</h2>
								<h3>Stuttgart <small>GMT+2</small></h3>
							</div>
						</div>
						<Timeline city="Stuttgart" />
					</div>
					<div>
						<div className="flex items-center m-4">
							<img className="rounded-full mr-4 border-4 border-yellow-400 w-32" src="https://media.discordapp.net/attachments/1089248000859197640/1095393600629645362/1rwYpGee.png?width=372&height=372" alt="" />
							<div>
								<h2 className="text-3xl">Naco</h2>
								<h3>Sidney <small>GMT+10</small></h3>
							</div>
						</div>
						<Timeline city="Sydney" />
					</div>
				</div>
			</QueryClientProvider>
		</div>
	)
}

export default App
