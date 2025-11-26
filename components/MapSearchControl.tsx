'use client'

import { useEffect, useState } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import { Search, X } from 'lucide-react'

interface GeoloniaResult {
  geometry: {
    coordinates: [number, number]
  }
  properties: {
    title: string
    description?: string
  }
}

export default function MapSearchControl() {
  const map = useMap()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<GeoloniaResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [marker, setMarker] = useState<L.Marker | null>(null)

  useEffect(() => {
    const searchAddress = async () => {
      if (query.length < 2) {
        setResults([])
        return
      }

      setIsSearching(true)
      try {
        // 国土地理院のジオコーディングAPIを使用
        const response = await fetch(
          `https://msearch.gsi.go.jp/address-search/AddressSearch?q=${encodeURIComponent(query)}`
        )
        const data = await response.json()
        
        if (data && Array.isArray(data)) {
          setResults(
            data.slice(0, 10).map((item: any) => ({
              geometry: {
                coordinates: [item.geometry.coordinates[0], item.geometry.coordinates[1]]
              },
              properties: {
                title: item.properties.title || item.properties.name,
                description: item.properties.dataSource
              }
            }))
          )
        } else {
          setResults([])
        }
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const timer = setTimeout(searchAddress, 300)
    return () => clearTimeout(timer)
  }, [query])

  const handleResultClick = (result: GeoloniaResult) => {
    const [lng, lat] = result.geometry.coordinates
    map.setView([lat, lng], 14)

    // 既存のマーカーを削除
    if (marker) {
      map.removeLayer(marker)
    }

    // カスタムアイコンを作成（SVGを使用）
    const searchIcon = L.icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="32" height="32">
          <path fill="#ef4444" stroke="white" stroke-width="2" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      `)}`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    })

    // 新しいマーカーを追加
    const newMarker = L.marker([lat, lng], { icon: searchIcon }).addTo(map)
    setMarker(newMarker)

    // 検索結果のみクリア（クエリは残す）
    setResults([])
  }

  const handleClear = () => {
    setQuery('')
    setResults([])
    if (marker) {
      map.removeLayer(marker)
      setMarker(null)
    }
  }

  // クエリが空になったらマーカーを削除
  useEffect(() => {
    if (query === '' && marker) {
      map.removeLayer(marker)
      setMarker(null)
    }
  }, [query, marker, map])

  useEffect(() => {
    return () => {
      if (marker) {
        map.removeLayer(marker)
      }
    }
  }, [map, marker])

  return (
    <div className="leaflet-top leaflet-right" style={{ marginTop: '10px', marginRight: '10px', pointerEvents: 'none' }}>
      <div className="leaflet-control" style={{ pointerEvents: 'auto' }}>
        <div className="relative">
          <div className="flex items-center bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600">
            <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 ml-3" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="住所を検索"
              className="w-64 px-3 py-2 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={handleClear}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-r-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              </button>
            )}
          </div>
          
          {results.length > 0 && (
            <div className="absolute top-full mt-1 w-full bg-white dark:bg-gray-700 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 max-h-60 overflow-y-auto z-[1000]">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 border-b border-gray-100 dark:border-gray-600 last:border-b-0 transition-colors"
                >
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {result.properties.title}
                  </div>
                  {result.properties.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {result.properties.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
