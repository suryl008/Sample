using Demo.Entities;
using Demo.Services.Models;
using Riok.Mapperly.Abstractions;

namespace Demo.Services.Mappers
{
    [Mapper]
    public partial class QuestionnaireMapper
    {
        public partial QuestionnaireModel ToModel(Questionnaire source);

        public partial Questionnaire ToEntity(QuestionnaireModel source);

        public IEnumerable<QuestionnaireModel> ToModels(IEnumerable<Questionnaire> source)
            => source.Select(ToModel);

        public List<QuestionnaireModel> ToModelList(IEnumerable<Questionnaire> source)
            => source.Select(ToModel).ToList();
    }
}
