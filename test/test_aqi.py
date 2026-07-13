from src.ingest import calculate_aqi


def test_o3():
    # 54.46 µg/m³ O3
    # -> 0.027 ppm after conversion/truncation
    # -> AQI 25
    assert calculate_aqi(54.46, "o3") == 25


def test_pm25():
    # 12.3 µg/m³ PM2.5
    # -> AQI 57
    assert calculate_aqi(12.3, "pm25") == 57


def test_pm10():
    # 43 µg/m³ PM10
    # -> AQI 40
    assert calculate_aqi(43, "pm10") == 40


def test_co():
    # 5000 µg/m³ CO
    # -> ~4.0 ppm
    # -> AQI 45
    assert calculate_aqi(5000, "co") == 49


def test_so2():
    # 100 µg/m³ SO2
    # -> ~38 ppb
    # -> AQI ~53
    assert calculate_aqi(100, "so2") == 54


def test_no2():
    # 100 µg/m³ NO2
    # -> ~53 ppb
    # -> AQI 50
    assert calculate_aqi(100, "no2") == 50