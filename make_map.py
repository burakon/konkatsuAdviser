import urllib.request
import json
import math
from shapely.geometry import shape, MultiPolygon

url = 'https://raw.githubusercontent.com/dataofjapan/land/master/japan.geojson'
req = urllib.request.urlopen(url)
data = json.loads(req.read())

def project(lon, lat):
    x = lon
    y = math.log(math.tan(math.pi/4 + math.radians(lat)/2))
    return x, y

polygons = []
for feature in data['features']:
    geom = shape(feature['geometry'])
    # Simplify geometry heavily! (Tolerance controls the chunkiness)
    geom = geom.simplify(0.08, preserve_topology=True)
    if geom.geom_type == 'Polygon':
        polygons.append(list(geom.exterior.coords))
    elif geom.geom_type == 'MultiPolygon':
        for poly in geom.geoms:
            polygons.append(list(poly.exterior.coords))

proj_coords = []
for poly in polygons:
    proj_poly = []
    for lon, lat in poly:
        proj_poly.append(project(lon, lat))
    proj_coords.append(proj_poly)

min_x = min([min([p[0] for p in poly]) for poly in proj_coords])
max_x = max([max([p[0] for p in poly]) for poly in proj_coords])
min_y = min([min([p[1] for p in poly]) for poly in proj_coords])
max_y = max([max([p[1] for p in poly]) for poly in proj_coords])

pad = 20
scale_x = (500 - 2*pad) / (max_x - min_x)
scale_y = (600 - 2*pad) / (max_y - min_y)
scale = min(scale_x, scale_y)

paths = []
for poly in proj_coords:
    if len(poly) < 5: continue
    
    path_str = "M"
    for i, (x, y) in enumerate(poly):
        px = pad + (x - min_x) * scale
        py = 600 - pad - (y - min_y) * scale
        
        # Round heavily to keep the string small
        if i == 0:
            path_str += f"{px:.0f},{py:.0f}"
        else:
            path_str += f" L{px:.0f},{py:.0f}"
    path_str += " Z"
    paths.append(path_str)

paths.sort(key=lambda x: len(x), reverse=True)
top_paths = paths[:5]

print("const shapes = [")
for p in top_paths:
    print(f"  '{p}',")
print("];")
