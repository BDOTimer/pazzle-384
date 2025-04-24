#ifndef PROVIDE_RES_H
#define PROVIDE_RES_H
/// "provide_res.h"
///----------------------------------------------------------------------------|
/// ...
///----------------------------------------------------------------------------:
#include "myl.h"
#include "../bin/resEXE/allResIndex.h"


///----------------------------------------------------------------------------|
/// Итерфейс.
///----------------------------------------------------------------------- IRes:
struct       IRes
{            IRes(){}
    virtual ~IRes(){}

    virtual void get2LoadHere (sf::Image& obj) = 0;

protected:

};


///----------------------------------------------------------------------------|
/// ProvideResources
///----------------------------------------------------------- ProvideResources:
struct  ResourcesFromFiles : IRes
{       ResourcesFromFiles()
        {

        }

    void get2LoadHere (sf::Image& obj)
    {   std::cout << "run ResourcesFromFiles::get2LoadHere(.):\n";

    }

private:

};
    #define __CLASS__ std::remove_reference<decltype(classMacroImpl(this))>::type

    template<class T> T& classMacroImpl(const T* t);

///----------------------------------------------------------------------------|
/// ProvideResources
///----------------------------------------------------------- ProvideResources:
struct  ProvideResources
{       ProvideResources()
        {
        }



private:
    IRes* pRes{nullptr};

    TEST
    {   INFOSTART;

        sf::Image img;

        IRes* p{nullptr};

        ResourcesFromFiles resFiles;
        p               = &resFiles;

        p->get2LoadHere(img);

        l(typeid(resFiles).name())

        INFOEND;
    }
};

#endif // PROVIDE_RES_H
