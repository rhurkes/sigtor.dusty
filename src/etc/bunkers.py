#These functions use another python class call "matfun.py" which has matrix and vector operations.  Available at http://users.rcn.com/python/download/python.htm


#mean wind for a layer AGL
#this algorith uses lists of wind direction and speed, heights and the top and
#bottom of the layer
#the key to finding the mean wind of a layer to move the coordinate system
#where the bottom of the layer is the new origin and the x-axis for the new
#coordinate system is the shear vector of the layer
#While this looks very nice graphically, it's pretty nasty mathematically 
def meanwind(wdirlist,wspdlist,hghtlist,blayer,tlayer):
  #make wind direction and speed into u-/v-components
  vector = vector_conv(wdirlist,wspdlist)
  #make heights of layer AGL
  blayer += hghtlist[0]
  tlayer += hghtlist[0]
  headvect = []
  tailvect = []
  i = 0
  #find the bottom and the top of the layer in the lists
  for hght in hghtlist:
    if hght == blayer:
      tailvect = [vector[0][i],vector[1][i]]
    elif hght == tlayer:
      headvect = [vector[0][i],vector[1][i]]
    elif hght > tlayer: break
    else: pass
    i += 1
  #if no vector head yet, linearly interpolate it (method not shown)
  if headvect == []:
    headvect = lininterp_wind(vector[0],vector[1],hghtlist,tlayer)
  #do the same for the tail of the vector
  if tailvect == []:
    tailvect = lininterp_wind(vector[0],vector[1],hghtlist,blayer)
  #move coordinate system to the tail of the vector [tail becomes origin]
  modheadvect = [headvect[0] - tailvect[0],headvect[1] - tailvect[1]]
  #find the angle between shear vector and x-axis
  angle = acos(modheadvect[0] / sqrt(modheadvect[0] ** 2 + modheadvect[1] ** 2))  if modheadvect[1] < 0:
    angle = -angle
  rotation = Mat([[cos(angle),-sin(angle)],[sin(angle),cos(angle)]])
  counter = Mat([[cos(angle),sin(angle)],[-sin(angle),cos(angle)]])
  i = 0
  j = 0
  vmod = 0
  #rotate the hodograph so that the new x-axis is the shear vector
  #between the top and bottom level of the layer for the mean wind
  #see the comet presentation on hodographs for graphical explanation
  #Section 5.5 at http://deved.comet.ucar.edu/mesoprim/hodograf/print.htm
  for hght in hghtlist:
    if hght >= blayer and hght <= tlayer:
      #modifty each wind ob to make set the tail as origin
      vect = [vector[0][i] - tailvect[0],vector[1][i] - tailvect[1]]
      mat = Mat([[vect[0]],[vect[1]]])
      #rotate to complete transition to new coordinate system 
      a = rotation.mmul(mat)
      vmod += a[1][0]
      j += 1
    elif hght > tlayer: break
    else: pass
    i += 1
  #make the head vector a matrix for upcoming math
  headmat = Mat([[modheadvect[0]],[modheadvect[1]]])
  #rotate the head vector to make it the nex x axis
  modheadmat = rotation.mmul(headmat)
  #to do the next part, it is assumed the wind measurements are evenly
  #distributed---this assumption MUST be met
  #the mean u wind component is just half of the difference of the bottom
  #level u-component and top level u-component 
  umodmean = modheadmat[0][0] / 2
  #the mean v wind component is an average of the v obs in coordinate system
  vmodmean = vmod / j
  #make mean wind matrix for upcoming math
  modmat = Mat([[umodmean],[vmodmean]])
  #rotate back and move to original origin
  meanmat = counter.mmul(modmat)
  meanwind = [meanmat[0][0] + tailvect[0],meanmat[1][0] + tailvect[1]]
  return meanwind

#The method takes in a wind direction and speed list and a height list to use 
#the ID method described in Bunkers et al 2000 for supercell motion estimate
def bunkersmotion(wdirlist,wspdlist,hghtlist):
  degree = pi / 180.
  #find the mean 0-6km wind
  mean = meanwind(wdirlist,wspdlist,hghtlist,0,6000)
  #find the upper 500 m wind; this is the head of the shear vector
  head = meanwind(wdirlist,wspdlist,hghtlist,5500,6000)
  #find the lower 500 m wind; this is the tail of the shear vector
  tail = meanwind(wdirlist,wspdlist,hghtlist,0,500)
  #deviation (as described in Bunkers et al 2000)
  D = 7.5
  #u-component of the shear vector
  shearu = head[0] - tail[0]
  #v-component of shear vector
  shearv = head[1] - tail[1]
#  shearmag = sqrt(shearu ** 2 + shearv ** 2)
  #make shear vector a vector in python
  shear = Vec([shearu,shearv,0])
#  rotate = Mat([[cos(-90. * degree),-sin(-90. * degree)],[sin(-90. * degree),cos(90. * degree)]])
#  shearterm = rotate.mmul(unitshear)
  #z-component unit matrix for use
  unitmat = Vec([0,0,1])
  #find k cross shear; Bunkers et al 2000, Eqns 1 & 2
  shearterm = shear.cross(unitmat)
  #Bunkers et al 2000, Eqn 1, u-component right mover
  #Basically what is done is the mean wind in the 0-6 km layer has a deviation,
  #that is weighted by the shear vector magnitude and direction, added to it
  #See Matthew J. Bunkers, Brian A. Klimowski, Jon W. Zeitler, Richard L. Thompson and Morris L. Weisman. 2000: Predicting Supercell Motion Using a New Hodograph Technique. Weather and Forecasting: Vol. 15, No. 1, pp. 6179. for full details
  meanu = mean[0] + D * (shearterm[0] / shear.norm())
  #v-component of right mover
  meanv = mean[1] + D * (shearterm[1] / shear.norm())
  #Bunkers et al 2000, Eqn 2, u-compnent left mover
  meanleftu = mean[0] - D * (shearterm[0] / shear.norm())
  #Bunkers et al 2000, Eqn 2, v-component left mover
  meanleftv = mean[1] - D * (shearterm[1] / shear.norm())
  #return vector motion components to user
  motion = [meanu,meanv,meanleftu,meanleftv]
  return motion
