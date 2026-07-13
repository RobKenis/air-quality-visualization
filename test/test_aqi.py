from src.ingest import calculate_aqi


def test_o3():
    assert calculate_aqi(0.07853333, "o3") == 126

def test_pm25():
    assert calculate_aqi(35.9, "pm25") == 102

def test_co():
    assert calculate_aqi(8.4, "co") == 90