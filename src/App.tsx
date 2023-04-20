import React, { HTMLAttributes, PropsWithChildren } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from 'react-query'
const queryClient = new QueryClient()

type TimelineProps = {
	city: string
} & HTMLAttributes<HTMLDivElement>


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
const getLatLngFromCity = (city: string): Promise<LatLngFromCityResult[]> => fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${openweatherApikey}`).then(r => r.json())
// const getSunriseSunset = (lat: number, lng: number): Promise<SunsetSunriseResult> => fetch(`https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}&formatted=0`).then(r => r.json())
const getTimezone = (lat: number, lng: number): Promise<GeonamesTimezoneResult> => fetch(`https://geonames-https.deno.dev?lat=${lat}&lng=${lng}`).then(r => r.json())

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
	const current = (new Date(timezone.time).getUTCHours() + 2) % 24
	return <div>
		{[...Array(hours)].map((_, i) => {
			const hourIndex = ((i * maxHours / hours) + timezone.dstOffset) % 24
			const hour = hourIndex < 0 ? 24 + hourIndex : hourIndex
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
							<img className="rounded-full mr-4 border-4 border-yellow-400 w-32" src="https://media.discordapp.net/attachments/1093622804164919376/1098728612326277120/IMG_2329-1.png?width=585&height=585" alt="" />
							<div>
								<h2 className="text-3xl">Jacky</h2>
								<h3>New York <small>GMT-5</small></h3>
							</div>
						</div>
						<Timeline city="New York" />
					</div>
				</div>
			</QueryClientProvider>
		</div>
	)
}

export default App
